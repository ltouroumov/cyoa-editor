import { drop, isNotEmpty, last, partition, take, unfold } from 'ramda';
import { match } from 'ts-pattern';

import type { Project } from '~/composables/project/types/v1';
import { bufferToString } from '~/composables/utils';
import type { CacheEvent } from '~/composables/viewer/cache/types';
import { downloadFile, formatBytes } from '~/composables/viewer/cache/utils';
import type { ViewerProject } from '~/composables/viewer/types';

let abortController: AbortController | null = null;

self.addEventListener(
  'message',
  (e: MessageEvent<{ event: string; replyTo?: string }>) => {
    const { event, replyTo = null } = e.data;
    try {
      const payload = JSON.parse(event) as CacheEvent;
      match(payload)
        .with({ type: 'init' }, () => {})
        .with({ type: 'cache' }, async ({ project, refresh = false }) => {
          abortController = new AbortController();
          try {
            await doCache(project, refresh, abortController.signal);
          } catch (err) {
            if (
              typeof err === 'object' &&
              err !== null &&
              'name' in err &&
              err.name === 'AbortError'
            ) {
              postMessage({ status: 'cancelled' });
            } else {
              console.error('error in cache worker', err);

              postMessage({
                status: 'failure',
                error: 'Failed to download project file (exception)',
              });
            }
          }
        })
        .with({ type: 'abort' }, () => {
          abortController?.abort();
          abortController = null;
        })
        .exhaustive();
    } catch (err) {
      console.error('error in cache worker', err);
    }
  },
);

async function doCache(
  project: ViewerProject,
  refresh: boolean,
  abortSignal: AbortSignal,
) {
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
    console.log(`[cache ${project.id}] project.json size: ${fileSize}`);
    if (!refresh && fileSize > 0) {
      projectBytes = new Uint8Array(fileSize);
      projectFileHandle.read(projectBytes, { at: 0 });
      console.log(`[cache ${project.id}] project.json already cached`);
    } else {
      postMessage({ status: 'progress', info: 'Downloading project file ...' });

      const result = await downloadFile(
        project.file_url,
        async (progress) => {
          if (progress.type === 'stream') {
            postMessage({
              status: 'progress',
              info: `Downloading project file ... ${formatBytes(progress.bytes)}`,
            });
          } else if (progress.type === 'decode') {
            postMessage({
              status: 'progress',
              info: `Downloading project file ...`,
            });
          }
        },
        abortSignal,
      );

      if ('error' in result) {
        postMessage({
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
    postMessage({
      status: 'failure',
      error: 'Failed to download project file.',
    });
    return;
  } finally {
    projectFileHandle.close();
  }

  const projectJson = bufferToString(projectBytes.buffer);
  const projectData = JSON.parse(projectJson) as Project;

  const imagesDir = await projectDir.getDirectoryHandle('images', {
    create: true,
  });

  const images = [];
  for (const rowData of projectData.rows) {
    if (isNotEmpty(rowData.image) && imageIsUrl(rowData.image)) {
      images.push(rowData.image);
    }

    for (const objData of rowData.objects) {
      if (isNotEmpty(objData.image) && imageIsUrl(objData.image)) {
        images.push(objData.image);
      }
    }
  }

  console.log(`[cache ${project.id}] found ${images.length} images to cache`);
  postMessage({
    status: 'progress',
    info: `Downloading images ... 0/${images.length}`,
  });
  // cache the images in batches of 10
  let progress = 0;
  let errors = 0;
  let cached = 0;
  let totalBytes = 0;
  for (const batch of chunk(images, 10)) {
    const results = await Promise.allSettled(
      batch.map((imageUrl) =>
        cacheImage(new URL(imageUrl), refresh, imagesDir, abortSignal),
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
    postMessage({
      status: 'progress',
      info: `Downloading images ... ${progress}/${images.length} (${cached > 0 ? `${cached} cached, ` : ''}${errors > 0 ? `${errors} errors, ` : ''}${formatBytes(totalBytes)})`,
    });

    if (abortSignal.aborted) {
      console.log(`[cache ${project.id}] cancelled`);
      postMessage({ status: 'cancelled' });
    }
  }

  postMessage({ status: 'completed' });
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

function imageIsUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function chunk<T>(input: T[], size: number): T[][] {
  return unfold((seed) => {
    if (seed.length === 0) return false;
    return [take(size, seed), drop(size, seed)];
  }, input);
}

async function attempt<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error('error in cache worker (attempt)', err);
    throw new Error('Failed to download project file (exception)');
  }
}
