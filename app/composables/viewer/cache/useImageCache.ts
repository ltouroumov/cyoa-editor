import { Base64 } from 'js-base64';
import { isNil, isNotNil, last } from 'ramda';
import { match } from 'ts-pattern';

import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import {
  imageIsCacheable,
  imageIsUrl,
} from '~/composables/utils/imageIsUrl';

export function useImageCache() {
  const { project, isLocal } = useProjectRefs();

  const loadImageSrc = async (
    element: ProjectObj | ProjectRow,
  ): Promise<string | null> => {
    // If there is no image, return null
    if (!element.image) return null;
    // If the image isn't cacheable (data URL, blob, etc.), return the value as-is
    if (!imageIsCacheable(element.image)) return element.image;

    if (!isLocal.value) {
      // If remote, use the link image from the project file
      // For relative paths, resolve against document.baseURI
      if (!imageIsUrl(element.image)) {
        return new URL(element.image, document.baseURI).href;
      }
      return element.image;
    } else if (isNotNil(project.value) && isNotNil(project.value.projectId)) {
      // When local, load the image from the local file system
      const localSrc = await loadImage(
        project.value!.projectId!,
        element.image,
      );
      // Fall back to the URL if the image is not cached locally
      if (isNil(localSrc)) return element.image;
      else return localSrc;
    }

    return null;
  };

  async function loadImage(
    projectId: string,
    image: string,
  ): Promise<string | null> {
    const imageObj = await resolveImage(projectId, image);
    if (isNil(imageObj)) return null;
    const imageBytes = await imageObj.file.bytes();
    const imageB64 = Base64.fromUint8Array(imageBytes);

    const imageMimeType = match(last(imageObj.name.split('.')))
      .with('webp', () => 'image/webp')
      .with('png', () => 'image/png')
      .with('jpg', () => 'image/jpeg')
      .with('jpeg', () => 'image/jpeg')
      .otherwise(() => 'image/jpeg');

    return `data:${imageMimeType};base64,${imageB64}`;
  }

  const resolveImage = async (
    projectId: string,
    image: string,
  ): Promise<{ name: string; file: File } | null> => {
    const fsHandle = await navigator.storage.getDirectory();
    // Create a directory to cache the project files
    const projectDir = await fsHandle.getDirectoryHandle(projectId, {
      create: true,
    });

    const imagesDir = await projectDir.getDirectoryHandle('images', {
      create: true,
    });

    // Handle both absolute URLs and relative paths
    let imageName: string;
    if (imageIsUrl(image)) {
      const imageUrl = new URL(image);
      imageName = last(imageUrl.pathname.split('/'))!;
    } else {
      // For relative paths, just get the filename
      imageName = last(image.split('/'))!;
    }
    try {
      const imageHandle = await imagesDir.getFileHandle(imageName);
      const imageFile = await imageHandle.getFile();
      if (imageFile.size === 0) return null;
      else return { name: imageName, file: imageFile };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        return null;
      }
      throw err;
    }
  };

  return { loadImageSrc, resolveImage };
}
