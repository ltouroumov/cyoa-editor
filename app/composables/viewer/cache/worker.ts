import {
  assoc,
  drop,
  flatten,
  includes,
  isNotEmpty,
  isNotNil,
  last,
  partition,
  take,
  unfold,
  uniq,
} from 'ramda';
import { match } from 'ts-pattern';

import type { Project } from '~/composables/project/types/v1';
import type { CacheItem } from '~/composables/shared/tables/viewer_projects';
import { bufferToString } from '~/composables/utils';
import { isCacheable, isUrl, resolveUrl } from '~/composables/utils/url';
import type {
  CacheEvent,
  CacheOptions,
  CacheResult,
  ClearOptions,
  ClearResult,
} from '~/composables/viewer/cache/types';
import {
  downloadFile,
  formatBytes,
  isAbortError,
} from '~/composables/viewer/cache/utils';
import type { ViewerProject } from '~/composables/viewer/types';

const BATCH_SIZE_DELETE = 100;
const BATCH_SIZE_DOWNLOAD = 20;
const PROGRESS_THROTTLE_MS = 200;
const BATCH_CHECK_THRESHOLD = 50;

type Task =
  | {
      taskId: string;
      type: 'cache';
      project: ViewerProject;
      options: CacheOptions;
      baseUrl: string;
      abortController: AbortController;
    }
  | {
      taskId: string;
      type: 'clear';
      options: ClearOptions;
      baseUrl: string;
      project: ViewerProject;
    };

const taskQueue: Task[] = [];
let currentTask: Task | null = null;

self.addEventListener(
  'message',
  (e: MessageEvent<{ event: string; replyTo?: string }>) => {
    const { event, replyTo = null } = e.data;
    try {
      const payload = JSON.parse(event) as CacheEvent;
      match(payload)
        .with({ type: 'init' }, () => {})
        .with({ type: 'cache' }, async ({ taskId, project, options, baseUrl }) => {
          const abortController = new AbortController();
          taskQueue.push({
            taskId,
            type: 'cache',
            project,
            options,
            baseUrl,
            abortController,
          });

          startNextTask();
        })
        .with({ type: 'clear' }, async ({ taskId, project, options, baseUrl }) => {
          taskQueue.push({
            taskId,
            type: 'clear',
            project,
            options,
            baseUrl,
          });

          startNextTask();
        })
        .with({ type: 'abort' }, ({ taskId }) => {
          console.log(`[cache] aborting task ${taskId}`);

          // First, check if we need to abort the current task.
          if (currentTask && currentTask.taskId === taskId) {
            // Use the abort controller (if present) to abort the task.
            if ('abortController' in currentTask) {
              console.log(`[cache] aborting task ${taskId} (controller)`);
              currentTask.abortController.abort();
            }
          }
          // Next, check if the task is still in the queue. If so, remove it.
          else {
            const pendingTaskIndex = taskQueue.findIndex(
              (task) => task.taskId === taskId,
            );
            if (pendingTaskIndex !== -1) {
              console.log(`[cache] clear task ${taskId} (queue)`);
              taskQueue.splice(pendingTaskIndex, 1);
            }
          }
        })
        .exhaustive();
    } catch (err) {
      console.error('error in cache worker', err);
    }
  },
);

function startNextTask(): void {
  console.log(
    `[cache] starting next task (current: ${currentTask?.taskId ?? 'N/A'}; queue length: ${taskQueue.length})`,
  );
  // If a task is already running, do nothing.
  if (currentTask !== null) {
    console.log(`[cache] task ${currentTask.taskId} is already running`);
    return;
  }

  // Take the next task from the queue.
  const task = taskQueue.shift();
  if (!task) {
    console.log(`[cache] no more tasks in the queue`);
    return;
  }
  console.log(`[cache] starting task ${task?.taskId ?? 'null'}`, taskQueue);

  // Dispatch the task in the background.
  currentTask = task;
  const taskExecution = match(task)
    .with(
      { type: 'cache' },
      ({ taskId, project, options, baseUrl, abortController }) => {
        return doCache(
          taskId,
          project,
          options,
          baseUrl,
          abortController.signal,
        ).catch((err: unknown) => {
          if (isAbortError(err)) {
            postMessage({
              taskId: task.taskId,
              status: 'cancelled',
            });
          } else {
            console.error('error in cache worker', err);

            postMessage({
              taskId: task.taskId,
              status: 'failure',
              error: 'Failed to download project file (exception)',
            });
          }
        });
    },
    )
    .with({ type: 'clear' }, ({ taskId, project, options, baseUrl }) => {
      return doClear(taskId, project, options, baseUrl).catch((err) => {
        console.error('error in cache worker', err);

        postMessage({
          taskId: taskId,
          status: 'failure',
          error: 'Failed to clear data (exception)',
        });
      });
    })
    .otherwise(() => {
      console.error('error in cache worker (unknown task type)', task);
      return Promise.resolve();
    });

  taskExecution.then(() => {
    currentTask = null;
    startNextTask();
  });
}

const safeDelete = async (
  handle: FileSystemDirectoryHandle,
  name: string,
  options?: FileSystemRemoveOptions,
): Promise<boolean> => {
  return handle
    .removeEntry(name, options)
    .then(() => true)
    .catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        return false; // Inherently "success" as it's already gone
      }
      throw err; // Re-throw real errors
    });
};

const getImageName = (url: string | URL): string => {
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  const parts = urlObj.pathname.split('/');
  const name = last(parts);
  return name && isNotEmpty(name) ? name : 'unknown_image';
};

const shouldCacheUrl = (url: string, isOriginLocal: boolean): boolean => {
  // If the project origin is local, we should only cache URLs
  if (isOriginLocal && !isUrl(url)) return false;
  return true;
};

const collectProjectImages = (
  projectData: Project,
  options: CacheOptions | ClearOptions,
  baseUrl: string,
): { rowId: string; images: string[] }[] => {
  const isOriginLocal = (options as CacheOptions).isOriginLocal ?? false;

  return projectData.rows
    .filter((row) => {
      if (options.images === true) return true;
      if (Array.isArray(options.images)) return includes(row.id, options.images);
      return false;
    })
    .map((row) => {
      // 1. Flatten all possible image sources in this row
      const rawImages: (string | undefined)[] = [
        row.image,
        ...row.objects.flatMap((obj) => [
          obj.image,
          ...obj.addons.map((addon) => addon.image),
        ]),
      ];

      // 2. Filter valid cacheable images and resolve URLs
      const images = rawImages
        .filter((img): img is string => isNotNil(img) && isNotEmpty(img))
        .filter((img) => isCacheable(img) && shouldCacheUrl(img, isOriginLocal))
        .map((img) => resolveUrl(img, baseUrl));

      return { rowId: row.id, images };
    })
    .filter((r) => r.images.length > 0);
};

async function doClear(
  taskId: string,
  project: ViewerProject,
  options: ClearOptions,
  baseUrl: string,
) {
  const fsHandle = await navigator.storage.getDirectory();

  // Clear Project Directory (if requested)
  if (options.project) {
    await safeDelete(fsHandle, project.id, { recursive: true });
    reply({ taskId, status: 'completed', deletedProject: true });
    return;
  }

  if (!options.images) {
    reply({ taskId, status: 'failure', error: 'Invalid clear options.' });
    return;
  }

  let projectData: Project;
  let projectFileHandle: FileSystemSyncAccessHandle | undefined = undefined;

  const projectDir = await fsHandle.getDirectoryHandle(project.id, {
    create: false,
  });

  try {
    const projectFile = await projectDir.getFileHandle('project.json');
    projectFileHandle = await projectFile.createSyncAccessHandle();
    const fileSize = projectFileHandle.getSize();
    const projectBytes: Uint8Array<ArrayBuffer> = new Uint8Array(fileSize);
    projectFileHandle.read(projectBytes, { at: 0 });

    const projectJson = bufferToString(projectBytes.buffer);
    projectData = JSON.parse(projectJson) as Project;
  } catch (err) {
    console.log(`[cache] failed to load project data`, err);
    reply({ taskId, status: 'failure', error: 'Failed to load project.' });
    return;
  } finally {
    projectFileHandle?.close();
  }

  const imagesDir = await projectDir.getDirectoryHandle('images', {
    create: false,
  });

  // Clear Specific Images
  // Check if we are clearing ALL rows
  const isDeletingAll =
    options.images === true ||
    (projectData.rows.length > 0 &&
     projectData.rows.every((r) => includes(r.id, options.images as string[])));

  if (isDeletingAll) {
    await safeDelete(projectDir, 'images', { recursive: true });
    reply({
      taskId,
      status: 'completed',
      deletedAllImages: true,
    });
    return;
  }

  const rowsToUpdate = collectProjectImages(projectData, options, baseUrl);
  const deletedCacheItems = rowsToUpdate.map((r) => r.rowId);
  const allCollectedImages = flatten(rowsToUpdate.map((r) => r.images));

  const images = uniq(allCollectedImages);

  reply({
    taskId,
    status: 'progress',
    info: `Deleting images ... 0/${images.length}`,
  });
  let progress = 0;
  let errors = 0;
  for (const batch of chunk(images, BATCH_SIZE_DELETE)) {
    if (options.abortSignal?.aborted) break;

    const results = await Promise.allSettled(
      batch.map((imageUrl) => deleteImage(new URL(imageUrl), imagesDir)),
    );

    const [_success, failures] = partition(
      (result) => result.status === 'fulfilled',
      results,
    );

    progress += results.length;
    errors += failures.length;
    reply({
      taskId,
      status: 'progress',
      info: `Deleting images ... ${progress}/${images.length} (${errors > 0 ? `${errors} errors` : ''})`,
    });
    console.log(`[cache] deleted ${progress} images`);
  }

  reply({
    taskId,
    status: 'completed',
    deletedCacheItems,
  });
}

async function doCache(
  taskId: string,
  project: ViewerProject,
  options: CacheOptions,
  baseUrl: string,
  abortSignal: AbortSignal,
): Promise<void> {
  const cachedItems: CacheItem[] = [];

  const fsHandle = await navigator.storage.getDirectory();

  const projectDir = await fsHandle.getDirectoryHandle(project.id, {
    create: true,
  });

  let projectBytes: Uint8Array;
  let projectFileHandle: FileSystemSyncAccessHandle | undefined;

  try {
    // Check if we already have the project file
    const projectFile = await projectDir.getFileHandle('project.json', {
      create: true,
    });
    projectFileHandle = await projectFile.createSyncAccessHandle();

    // Check existing size
    const fileSize = projectFileHandle.getSize();
    const hasExistingFile = fileSize > 0;

    let shouldDownloadProject = false;

    if (!hasExistingFile) {
      // Must download if missing, even if options.project is false
      shouldDownloadProject = true;
    } else {
      const isUpdateMode =
        options.mode === 'refresh-all' || options.mode === 'refresh-existing';
      const isProjectRequested = options.project !== false;

      if (isUpdateMode && isProjectRequested) {
        shouldDownloadProject = true;
      }
    }

    if (!shouldDownloadProject) {
      // Just read existing
      projectBytes = new Uint8Array(fileSize);
      projectFileHandle.read(projectBytes, { at: 0 });
      console.log(
        `[cache ${project.id}] project.json exists (${fileSize} bytes), skipping download`,
      );
    } else {
      reply({
        taskId,
        status: 'progress',
        info: 'Downloading project file ...',
      });

      let lastUpdate = Date.now();
      const result = await downloadFile(
        project.file_url,
        async (progress) => {
          const now = Date.now();
          if (now - lastUpdate < PROGRESS_THROTTLE_MS) return;
          lastUpdate = now;

          if (progress.type === 'stream') {
            reply({
              taskId,
              status: 'progress',
              info: `Downloading project file ... ${formatBytes(progress.bytes)}`,
            });
          } else if (progress.type === 'decode') {
            reply({
              taskId,
              status: 'progress',
              info: `Downloading project file ...`,
            });
          }
        },
        abortSignal,
      );

      if ('error' in result) {
        reply({
          taskId,
          status: 'failure',
          error: `Failed to download project file (HTTP ${result.status})`,
        });
        return;
      }

      projectBytes = result.data;
      projectFileHandle.truncate(0);
      projectFileHandle.write(projectBytes.buffer, { at: 0 });
      console.log(`[cache ${project.id}] project.json cached`);
    }
  } catch (err) {
    console.error('error in cache worker (download)', err);
    reply({
      taskId,
      status: 'failure',
      error: 'Failed to download project file.',
    });
    return;
  } finally {
    projectFileHandle?.close();
  }



  if (isNotNil(options.images)) {
    const projectJson = bufferToString(projectBytes.buffer as ArrayBuffer);
    const projectData = JSON.parse(projectJson) as Project;

    const imagesDir = await projectDir.getDirectoryHandle('images', {
      create: true,
    });

    const rowsToUpdate = collectProjectImages(projectData, options, baseUrl);

    const images = uniq(flatten(rowsToUpdate.map((r) => r.images)));
    const successfulImages = new Map<string, number>();

    console.log(`[cache ${project.id}] found ${images.length} images to cache`);
    reply({
      taskId,
      status: 'progress',
      info: `Checking cache status...`,
    });
    // Pre-scan the directory to get a set of existing files
    // Required for 'refresh-existing' and optimization for 'refresh-missing'
    let existingFiles = new Map<string, number>();
    if (
      options.mode === 'refresh-existing' ||
      options.mode === 'refresh-missing'
    ) {
      // For small batches, check files individually
      if (images.length < BATCH_CHECK_THRESHOLD) {
        await Promise.allSettled(
          images.map(async (url) => {
            if (abortSignal.aborted) return;
              const name = getImageName(url);
              await imagesDir
                .getFileHandle(name)
                .then((handle) => handle.getFile())
                .then((file) => existingFiles.set(name, file.size))
                .catch(() => {
                  // File doesn't exist, ignore
                });
          }),
        );
      } else {
        for await (const entry of imagesDir.values()) {
          if (abortSignal.aborted) break;
          if (entry.kind === 'file') {
            const file = await (entry as FileSystemFileHandle).getFile();
            existingFiles.set(entry.name, file.size);
          }
        }
      }
    }
    
    if (abortSignal.aborted) {
      console.log(`[cache ${project.id}] cancelled during pre-scan`);

      // Populate cachedItems based on successful downloads so far
      const items = calculateCacheResults(rowsToUpdate, successfulImages);
      console.log(
        `[cache ${project.id}] replying cancelled with ${items.length} items`,
      );

      reply({ taskId, status: 'cancelled', cachedItems: items });
      return;
    }

    // Filter images based on mode
    let imagesToProcess = images;
    if (options.mode === 'refresh-existing') {
      imagesToProcess = images.filter((imageUrl) => {
        const imageName = getImageName(imageUrl);
        return existingFiles.has(imageName);
      });
    } else if (options.mode === 'refresh-missing') {
      imagesToProcess = images.filter((imageUrl) => {
        const imageName = getImageName(imageUrl);
        if (existingFiles.has(imageName)) {
          successfulImages.set(imageUrl, existingFiles.get(imageName)!);
          return false;
        }
        return true;
      });
    }

    // cache the images in batches of 20
    if (imagesToProcess.length > 0) {
      reply({
        taskId,
        status: 'progress',
        info: `Downloading images ... 0/${imagesToProcess.length}`,
      });
    }

    let progress = 0;
    let errors = 0;
    let cached = 0;
    let totalBytes = 0;
    for (const batch of chunk(imagesToProcess, BATCH_SIZE_DOWNLOAD)) {
      const results = await Promise.allSettled(
        batch.map(async (imageUrl) => {
          return cacheImage(
            new URL(imageUrl),
            options.mode !== 'refresh-missing', // overwrite if not strictly 'refresh-missing'
            imagesDir,
            abortSignal,
          ).then(assoc('url', imageUrl));
        }),
      );

      const [succeeded, failed] = partition(
        (r) => r.status === 'fulfilled',
        results,
      );

      for (const result of succeeded) {
        if (result.status !== 'fulfilled') continue;

        const resultValue = result.value;

        successfulImages.set(resultValue.url, resultValue.bytes);
        if (resultValue.local) cached++;
        totalBytes += resultValue.bytes;
      }

      errors += failed.length;
      progress += results.length;

      reply({
        taskId,
        status: 'progress',
        info: `Downloading images ... ${progress}/${imagesToProcess.length} (${cached > 0 ? `${cached} cached, ` : ''}${errors > 0 ? `${errors} errors, ` : ''}${formatBytes(totalBytes)})`,
      });

      if (abortSignal.aborted) {
        console.log(`[cache ${project.id}] cancelled`);

        // Populate cachedItems based on successful downloads so far
        const items = calculateCacheResults(rowsToUpdate, successfulImages);
        console.log(
          `[cache ${project.id}] replying cancelled with ${items.length} items`,
        );

        reply({ taskId, status: 'cancelled', cachedItems: items });
        return;
      }
    }

    // Populate cachedItems based on successful downloads
    const items = calculateCacheResults(rowsToUpdate, successfulImages);

    cachedItems.push(...items);
  }

  reply({ taskId, status: 'completed', cachedItems });
}

async function cacheImage(
  imageUrl: URL,
  refresh: boolean,
  imagesDir: FileSystemDirectoryHandle,
  abortSignal: AbortSignal,
): Promise<{ name: string; bytes: number; local: boolean }> {
  const imageName = getImageName(imageUrl);
  const imageFile = await imagesDir.getFileHandle(imageName, {
    create: true,
  });

  // Check if we have a valid cached copy before acquiring a lock
  const result = await imageFile
    .getFile()
    .then((file) => {
      if (!refresh && file.size > 0) {
        return { name: imageName, bytes: file.size, local: true };
      }
      return undefined;
    })
    .catch(() => undefined);

  if (result) return result;

  let imageFileHandle: FileSystemSyncAccessHandle | null = null;
  try {
    imageFileHandle = await imageFile.createSyncAccessHandle();
    
    // Double check size after lock in case of race (rare)
    if (!refresh) {
      const imageSize = imageFileHandle.getSize();
      if (imageSize > 0) {
        return { name: imageName, bytes: imageSize, local: true };
      }
    }

    const imageResponse = await fetch(imageUrl, { signal: abortSignal });

    // Check if the response is successful
    if (!imageResponse.ok) {
      throw new Error(
        `HTTP ${imageResponse.status}: Failed to download ${imageName}`,
      );
    }

    // Validate content-type is an image (not HTML error page)
    // Allow empty content-type as some servers don't set it
    const contentType = imageResponse.headers.get('content-type') || '';
    if (contentType && !contentType.startsWith('image/')) {
      throw new Error(
        `Invalid content-type for ${imageName}: ${contentType}`,
      );
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Truncate to 0 first to handle overwrites, then write new data
    imageFileHandle.truncate(0);
    imageFileHandle.write(imageBuffer, { at: 0 });
    imageFileHandle.flush();

    return { name: imageName, bytes: imageBlob.size, local: false };
  } catch (e) {
    console.error(`[cache] Error caching ${imageName}:`, e);
    throw e;
  } finally {
    imageFileHandle?.close();
  }
}

async function deleteImage(
  imageUrl: URL,
  imagesDir: FileSystemDirectoryHandle,
): Promise<void> {
  const imageName = getImageName(imageUrl);
  await imagesDir.removeEntry(imageName).catch((err) => {
    console.warn(`[cache] failed to delete image ${imageName}`, err);
    throw err;
  });
}

function chunk<T>(input: T[], size: number): T[][] {
  return unfold((seed) => {
    if (seed.length === 0) return false;
    return [take(size, seed), drop(size, seed)];
  }, input);
}

function reply(payload: CacheResult | ClearResult) {
  postMessage(payload);
}

function calculateCacheResults(
  rows: { rowId: string; images: string[] }[],
  successfulImages: Map<string, number>,
): CacheItem[] {
  return rows
    .map((row) => {
      const cachedImages = row.images.filter((url) =>
        successfulImages.has(url),
      );
      return {
        type: 'images.row' as const,
        rowId: row.rowId,
        count: cachedImages.length,
        size: cachedImages.reduce(
          (acc, url) => acc + (successfulImages.get(url) ?? 0),
          0,
        ),
      };
    })
    .filter((item) => item.count > 0);
}
