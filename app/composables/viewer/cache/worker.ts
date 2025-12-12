import {
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
import { imageIsUrl } from '~/composables/utils/imageIsUrl';
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
      abortController: AbortController;
    }
  | {
      taskId: string;
      type: 'clear';
      options: ClearOptions;
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
        .with({ type: 'cache' }, async ({ taskId, project, options = {} }) => {
          const abortController = new AbortController();
          taskQueue.push({
            taskId,
            type: 'cache',
            project,
            options,
            abortController,
          });

          startNextTask();
        })
        .with({ type: 'clear' }, async ({ taskId, project, options }) => {
          taskQueue.push({
            taskId,
            type: 'clear',
            project,
            options,
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
      ({ taskId, project, options, abortController }) => {
        return doCache(taskId, project, options, abortController.signal).catch(
          (err) => {
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
    .with({ type: 'clear' }, ({ taskId, project, options }) => {
      return doClear(taskId, project, options).catch((err) => {
        console.error('error in cache worker', err);

        postMessage({
          taskId: taskId,
          status: 'failure',
          error: 'Failed to download project file (exception)',
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
      const projectFile = await projectDir.getFileHandle('project.json', {
        create: true,
      });

      const projectFileHandle = await projectFile.createSyncAccessHandle();
      const fileSize = projectFileHandle.getSize();
      const projectBytes: Uint8Array<ArrayBuffer> = new Uint8Array(fileSize);
      projectFileHandle.read(projectBytes, { at: 0 });

      const projectJson = bufferToString(projectBytes.buffer);
      const projectData = JSON.parse(projectJson) as Project;

      const imagesDir = await projectDir.getDirectoryHandle('images', {
        create: false,
      });

      const deletedCacheItems: string[] = [];
      const images0: string[] = [];
      for (const rowData of projectData.rows) {
        if (!includes(rowData.id, options.images)) {
          // Skip the row if it's not in the list of images to cache.
          continue;
        }

        deletedCacheItems.push(rowData.id);
        if (isNotEmpty(rowData.image) && imageIsUrl(rowData.image)) {
          images0.push(rowData.image);
        }

        for (const objData of rowData.objects) {
          if (isNotEmpty(objData.image) && imageIsUrl(objData.image)) {
            images0.push(objData.image);
          }

          for (const objAddon of objData.addons) {
            if (isNotEmpty(objAddon.image) && imageIsUrl(objAddon.image)) {
              images0.push(objAddon.image);
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
      for (const batch of chunk(images, 20)) {
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

  if (isNotNil(options.images)) {
    const projectJson = bufferToString(projectBytes.buffer);
    const projectData = JSON.parse(projectJson) as Project;

    const imagesDir = await projectDir.getDirectoryHandle('images', {
      create: true,
    });

    const images0: string[][] = [];
    for (const rowData of projectData.rows) {
      if (
        options.images !== true &&
        !(Array.isArray(options.images) && includes(rowData.id, options.images))
      ) {
        // Skip the row if it's not in the list of images to cache.
        continue;
      }

      const rowImages = [];
      if (isNotEmpty(rowData.image) && imageIsUrl(rowData.image)) {
        rowImages.push(rowData.image);
      }

      for (const objData of rowData.objects) {
        if (isNotEmpty(objData.image) && imageIsUrl(objData.image)) {
          rowImages.push(objData.image);
        }

        for (const objAddon of objData.addons) {
          if (isNotEmpty(objAddon.image) && imageIsUrl(objAddon.image)) {
            rowImages.push(objAddon.image);
          }
        }
      }

      if (rowImages.length > 0) {
        images0.push(rowImages);
        cachedItems.push({
          type: 'images.row',
          rowId: rowData.id,
          count: rowImages.length,
        });
      }
    }

    const images = uniq(flatten(images0));

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
          ),
        ),
      );

      const [success, failures] = partition(
        (result) => result.status === 'fulfilled',
        results,
      );

      progress += results.length;
      errors += failures.length;
      cached += success.filter((result) => result.value.cached).length;
      totalBytes += success.reduce((acc, { value }) => acc + value.bytes, 0);
      reply({
        taskId,
        status: 'progress',
        info: `Downloading images ... ${progress}/${images.length} (${cached > 0 ? `${cached} cached, ` : ''}${errors > 0 ? `${errors} errors, ` : ''}${formatBytes(totalBytes)})`,
      });

      if (abortSignal.aborted) {
        console.log(`[cache ${project.id}] cancelled`);
        reply({ taskId, status: 'cancelled' });
      }
    }
  }

  reply({ taskId, status: 'completed', cachedItems });
}

async function cacheImage(
  imageUrl: URL,
  refresh: boolean,
  imagesDir: FileSystemDirectoryHandle,
  abortSignal: AbortSignal,
): Promise<{ name: string; bytes: number; cached: boolean }> {
  const imageName = last(imageUrl.pathname.split('/'))!;
  const imageFile = await imagesDir.getFileHandle(imageName, {
    create: true,
  });

  let imageFileHandle = null;
  try {
    imageFileHandle = await imageFile.createSyncAccessHandle();
    const imageSize = imageFileHandle.getSize();
    if (!refresh && imageSize > 0) {
      return { name: imageName, bytes: imageSize, cached: true };
    }

    const imageResponse = await fetch(imageUrl, { signal: abortSignal });
    const imageBlob = await imageResponse.blob();
    imageFileHandle.write(await imageBlob.arrayBuffer());

    return { name: imageName, bytes: imageBlob.size, cached: false };
  } catch (e) {
    throw new Error(`Failed to download image ${imageName}.`);
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
