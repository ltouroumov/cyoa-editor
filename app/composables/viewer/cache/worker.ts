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
        .with({ type: 'cache' }, async ({ taskId, project, options = {}, baseUrl }) => {
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

function startNextTask() {
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
  const fiber = match(task)
    .with(
      { type: 'cache' },
      ({ taskId, project, options, baseUrl, abortController }) => {
        return doCache(
          taskId,
          project,
          options,
          baseUrl,
          abortController.signal,
        ).catch((err) => {
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
          },
        );
      },
    )
    .with({ type: 'clear' }, ({ taskId, project, options, baseUrl }) => {
      return doClear(taskId, project, options, baseUrl).catch((err) => {
        console.error('error in cache worker', err);

        postMessage({
          taskId: taskId,
          status: 'failure',
          error: 'Failed to clead data (exception)',
        });
      });
    })
    .otherwise(() => {
      console.error('error in cache worker (unknown task type)', task);
      return Promise.resolve();
    });

  fiber.then(() => {
    currentTask = null;
    startNextTask();
  });
}

async function doClear(
  taskId: string,
  project: ViewerProject,
  options: ClearOptions,
  baseUrl: string,
) {
  const fsHandle = await navigator.storage.getDirectory();

  if (options.project) {
    await fsHandle.removeEntry(project.id, { recursive: true });
    reply({ taskId, status: 'completed', deletedProject: true });
  } else if (options.images) {
    const projectDir = await fsHandle.getDirectoryHandle(project.id, {
      create: false,
    });

    if (options.images === true) {
      await projectDir.removeEntry('images', { recursive: true });
      reply({
        taskId,
        status: 'completed',
        deletedAllImages: true,
      });
    } else {
      let projectData: Project;
      let projectFileHandle: FileSystemSyncAccessHandle | undefined = undefined;
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

      // Optimization: Check if we are clearing ALL rows
      // If so, use the fast directory delete instead of iterating files
      const isDeletingAll =
        projectData.rows.length > 0 &&
        projectData.rows.every((r) => includes(r.id, options.images as string[]));

      if (isDeletingAll) {
        try {
          await projectDir.removeEntry('images', { recursive: true });
        } catch (e) {
          // Ignore if images dir doesn't exist
        }
        reply({
          taskId,
          status: 'completed',
          deletedAllImages: true,
        });
        return;
      }

      const deletedCacheItems: string[] = [];
      const images0: string[] = [];
      for (const rowData of projectData.rows) {
        if (!includes(rowData.id, options.images)) {
          // Skip the row if it's not in the list of images to cache.
          continue;
        }

        deletedCacheItems.push(rowData.id);
        if (isNotEmpty(rowData.image) && isCacheable(rowData.image)) {
          images0.push(resolveUrl(rowData.image, baseUrl));
        }

        for (const objData of rowData.objects) {
          if (isNotEmpty(objData.image) && isCacheable(objData.image)) {
            images0.push(resolveUrl(objData.image, baseUrl));
          }

          for (const objAddon of objData.addons) {
            if (isNotEmpty(objAddon.image) && isCacheable(objAddon.image)) {
              images0.push(resolveUrl(objAddon.image, baseUrl));
            }
          }
        }
      }

      const images = uniq(images0);

      reply({
        taskId,
        status: 'progress',
        info: `Deleting images ... 0/${images.length}`,
      });
      let progress = 0;
      let errors = 0;
      for (const batch of chunk(images, 100)) {
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
  } else {
    reply({ taskId, status: 'failure', error: 'Invalid clear options.' });
  }
}

async function doCache(
  taskId: string,
  project: ViewerProject,
  options: CacheOptions,
  baseUrl: string,
  abortSignal: AbortSignal,
) {
  const cachedItems: CacheItem[] = [];

  const fsHandle = await navigator.storage.getDirectory();

  // Create a directory to cache the project files
  const projectDir = await fsHandle.getDirectoryHandle(project.id, {
    create: true,
  });

  const projectFile = await projectDir.getFileHandle('project.json', {
    create: true,
  });

  const projectFileHandle = await projectFile.createSyncAccessHandle();
  let projectBytes: Uint8Array<ArrayBuffer>;
  try {
    const fileSize = projectFileHandle.getSize();
    if ((!options.refresh || options.project === false) && fileSize > 0) {
      projectBytes = new Uint8Array(fileSize);
      projectFileHandle.read(projectBytes, { at: 0 });
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

          // Only sent updates every 200ms to avoid congestion in the message queue.
          if (now - lastUpdate < 200) return;

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
      projectFileHandle.write(projectBytes.buffer);
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
    projectFileHandle.close();
  }

  const shouldCache = (url: string) => {
    // If the project origin is local, we should only cache URLs
    // Relative paths in local projects are assumed to be local files that we can't access/cache
    if (options.isOriginLocal && !isUrl(url)) return false;
    return true;
  };

  if (isNotNil(options.images)) {
    const projectJson = bufferToString(projectBytes.buffer);
    const projectData = JSON.parse(projectJson) as Project;

    const imagesDir = await projectDir.getDirectoryHandle('images', {
      create: true,
    });

    const rowsToUpdate: { rowId: string; images: string[] }[] = [];
    for (const rowData of projectData.rows) {
      if (
        options.images !== true &&
        !(Array.isArray(options.images) && includes(rowData.id, options.images))
      ) {
        // Skip the row if it's not in the list of images to cache.
        continue;
      }

      const rowImages = [];
      if (
        isNotEmpty(rowData.image) &&
        isCacheable(rowData.image) &&
        shouldCache(rowData.image)
      ) {
        rowImages.push(resolveUrl(rowData.image, baseUrl));
      }

      for (const objData of rowData.objects) {
        if (
          isNotEmpty(objData.image) &&
          isCacheable(objData.image) &&
          shouldCache(objData.image)
        ) {
          rowImages.push(resolveUrl(objData.image, baseUrl));
        }

        for (const objAddon of objData.addons) {
          if (
            isNotEmpty(objAddon.image) &&
            isCacheable(objAddon.image) &&
            shouldCache(objAddon.image)
          ) {
            rowImages.push(resolveUrl(objAddon.image, baseUrl));
          }
        }
      }

      if (rowImages.length > 0) {
        rowsToUpdate.push({ rowId: rowData.id, images: rowImages });
      }
    }

    const images = uniq(flatten(rowsToUpdate.map((r) => r.images)));
    const successfulImages = new Set<string>();

    console.log(`[cache ${project.id}] found ${images.length} images to cache`);
    reply({
      taskId,
      status: 'progress',
      info: `Downloading images ... 0/${images.length}`,
    });
    // cache the images in batches of 10
    let progress = 0;
    let errors = 0;
    let cached = 0;
    let totalBytes = 0;
    for (const batch of chunk(images, 20)) {
      const results = await Promise.allSettled(
        batch.map((imageUrl) =>
          cacheImage(
            new URL(imageUrl),
            options.refresh ?? false,
            imagesDir,
            abortSignal,
          ).then(assoc('url', imageUrl)),
        ),
      );

      const [succeeded, failed] = partition(
        (r) => r.status === 'fulfilled',
        results,
      );

      for (const result of succeeded) {
        const val = (
          result as PromiseFulfilledResult<{
            url: string;
            name: string;
            bytes: number;
            local: boolean;
          }>
        ).value;
        successfulImages.add(val.url);
        if (val.local) cached++;
        totalBytes += val.bytes;
      }

      errors += failed.length;
      progress += results.length;
 
      reply({
        taskId,
        status: 'progress',
        info: `Downloading images ... ${progress}/${images.length} (${cached > 0 ? `${cached} cached, ` : ''}${errors > 0 ? `${errors} errors, ` : ''}${formatBytes(totalBytes)})`,
      });

      if (abortSignal.aborted) {
        console.log(`[cache ${project.id}] cancelled`);
        
        // Populate cachedItems based on successful downloads so far
        const items = calculateCacheResults(rowsToUpdate, successfulImages);

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
  const imageName = last(imageUrl.pathname.split('/'))!;
  const imageFile = await imagesDir.getFileHandle(imageName, {
    create: true,
  });

  let imageFileHandle: FileSystemSyncAccessHandle | null = null;
  try {
    imageFileHandle = await imageFile.createSyncAccessHandle();
    const imageSize = imageFileHandle.getSize();
    if (!refresh && imageSize > 0) {
      return { name: imageName, bytes: imageSize, local: true };
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
  const imageName = last(imageUrl.pathname.split('/'))!;
  try {
    await imagesDir.removeEntry(imageName);
  } catch (err) {
    console.warn(`[cache] failed to delete image ${imageName}`, err);
    throw err;
  }
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
  successfulImages: Set<string>,
): CacheItem[] {
  return rows
    .map((row) => ({
      type: 'images.row' as const,
      rowId: row.rowId,
      count: row.images.filter((url) => successfulImages.has(url)).length,
    }))
    .filter((item) => item.count > 0);
}
