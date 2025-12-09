import { Base64 } from 'js-base64';
import { isNotNil, last } from 'ramda';
import { match } from 'ts-pattern';

import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import { imageIsUrl } from '~/composables/utils/imageIsUrl';

export function useImageSrc() {
  const { project, isLocal } = useProjectRefs();

  const loadImageSrc = async (
    element: ProjectObj | ProjectRow,
  ): Promise<string | null> => {
    // If there is no image, return null
    if (!element.image) return null;
    // If the image isn't an URL, return the value as-is
    if (!imageIsUrl(element.image)) return element.image;

    if (!isLocal.value) {
      // If remote, use the link image from the project file
      return element.image;
    } else if (isNotNil(project.value) && isNotNil(project.value.projectId)) {
      // When local, load the image from the local file system
      return await loadImage(project.value!.projectId!, element.image);
    }

    return null;
  };

  return { loadImageSrc };
}

async function loadImage(projectId: string, image: string): Promise<string> {
  const fsHandle = await navigator.storage.getDirectory();
  // Create a directory to cache the project files
  const projectDir = await fsHandle.getDirectoryHandle(projectId, {
    create: true,
  });

  const imagesDir = await projectDir.getDirectoryHandle('images', {
    create: true,
  });

  const imageUrl = new URL(image);
  const imageName = last(imageUrl.pathname.split('/'))!;
  console.log('loading image', imageName);
  const imageHandle = await imagesDir.getFileHandle(imageName);
  const imageFile = await imageHandle.getFile();
  const imageBytes = await imageFile.bytes();
  const imageB64 = Base64.fromUint8Array(imageBytes);

  const imageMimeType = match(last(imageName.split('.')))
    .with('webp', () => 'image/webp')
    .with('png', () => 'image/png')
    .with('jpg', () => 'image/jpeg')
    .with('jpeg', () => 'image/jpeg')
    .otherwise(() => 'image/jpeg');

  const imageSrc = `data:${imageMimeType};base64,${imageB64}`;
  console.log(
    `loaded image ${imageName} (${imageSrc.length} bytes): ${imageSrc.slice(0, 100)}[...]${imageSrc.slice(-100)}`,
  );
  return imageSrc;
}
