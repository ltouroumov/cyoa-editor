import { isNotEmpty, last } from 'ramda';
import { match } from 'ts-pattern';

import type { Project } from '~/composables/project/types/v1';
import { bufferToString } from '~/composables/utils';
import type { CacheEvent } from '~/composables/viewer/cache/types';
import { downloadFile } from '~/composables/viewer/cache/utils';
import type { ViewerProject } from '~/composables/viewer/types';

self.addEventListener(
  'message',
  (e: MessageEvent<{ event: string; replyTo?: string }>) => {
    const { event, replyTo = null } = e.data;
    try {
      const payload = JSON.parse(event) as CacheEvent;
      match(payload)
        .with({ type: 'init' }, () => {})
        .with({ type: 'cache' }, async ({ project }) => {
          const result = await doCache(project);
          postMessage({
            replyTo: replyTo,
            message: JSON.stringify(result),
          });
        })
        .exhaustive();
    } catch (e) {
      console.log('error in search worker', e);
    }
  },
);

async function doCache(project: ViewerProject) {
  const result = await downloadFile(project.file_url, async (progress) => {
    console.log(`progress ${project.id}`, progress);
  });

  if ('error' in result) {
    return { status: 'error' };
  }

  const projectBytes = result.data;
  const projectJson = bufferToString(projectBytes.buffer);
  const projectData = JSON.parse(projectJson) as Project;

  const fsHandle = await navigator.storage.getDirectory();

  // Create a directory to cache the project files
  const projectDir = await fsHandle.getDirectoryHandle(project.id, {
    create: true,
  });
  const projectFile = await projectDir.getFileHandle('project.json', {
    create: true,
  });
  const projectFileHandle = await projectFile.createSyncAccessHandle();
  projectFileHandle.write(projectBytes.buffer);
  console.log(`[cache ${project.id}] project.json cached`);

  const imagesDir = await projectDir.getDirectoryHandle('images', {
    create: true,
  });

  for (const rowData of projectData.rows) {
    if (isNotEmpty(rowData.image) && imageIsUrl(rowData.image)) {
      const imageName = await cacheImage(new URL(rowData.image), imagesDir);
      console.log(
        `[cache ${project.id}] image for row ${rowData.id} cached as ${imageName}`,
      );
    }

    for (const objData of rowData.objects) {
      if (isNotEmpty(objData.image) && imageIsUrl(objData.image)) {
        const imageName = await cacheImage(new URL(objData.image), imagesDir);
        console.log(
          `[cache ${project.id}] image for obj ${objData.id} cached as ${imageName}`,
        );
      }
    }
  }

  return { status: 'success' };
}

async function cacheImage(imageUrl: URL, imagesDir: FileSystemDirectoryHandle) {
  const imageName = last(imageUrl.pathname.split('/'))!;
  const imageFile = await imagesDir.getFileHandle(imageName, {
    create: true,
  });
  const imageFileHandle = await imageFile.createSyncAccessHandle();

  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  imageFileHandle.write(await imageBlob.arrayBuffer());
  return imageName;
}

function imageIsUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
