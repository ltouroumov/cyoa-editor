import { Base64 } from 'js-base64';
import { isNil, isNotNil, last } from 'ramda';
import { match } from 'ts-pattern';

import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useDexie } from '~/composables/shared/useDexie';
import { useProjectRefs } from '~/composables/store/project';
import { useSettingStore } from '~/composables/store/settings';
import {
  isCacheable,
  isAbsoluteUrl,
  resolveUrl,
} from '~/composables/utils/resolveUrl';

// variables to memoize state for reducing database lookups
let memoizedOrigin: Promise<string | undefined> | null = null;
let memoizedProjectId: string | undefined;

const getProjectOrigin = (id: string, dexie: ReturnType<typeof useDexie>) => {
  if (id !== memoizedProjectId || !memoizedOrigin) {
    memoizedProjectId = id;
    memoizedOrigin = dexie.viewer_projects_cache.get(id).then((p) => p?.origin);
  }
  return memoizedOrigin;
};

export function useImageCache() {
  const { project, isCached } = useProjectRefs();
  const dexie = useDexie();
  const settingsStore = useSettingStore();
  
  const loadImageSrc = async (
    element: ProjectObj | ProjectRow,
  ): Promise<string | null> => {

    // Check if image isn't cacheable (data URL, blob, empty etc.), return the value as-is
    if (!isCacheable(element.image)) return element.image;

    let origin: string | undefined;
    // Check if Project is in OPFS Cache
    if (isCached.value && isNotNil(project.value) && isNotNil(project.value.projectId)) {
      const cachedSrc = await loadImage(
        project.value.projectId,
        element.image,
      );

      // Check if OPFS cache has an image, return it
      if (isNotNil(cachedSrc)) return cachedSrc;

      // get project origin for future checks
      origin = await getProjectOrigin(project.value.projectId, dexie);
    }
    
    // if fetching is not allowed, return null
    if (settingsStore.hideUncachedImages) return null;

    // fetching is allowed, check if origin is local and image is relative
    if(origin === 'local' && !isAbsoluteUrl(element.image)) {
      return null;
    }

    // Project is not in OPFS cache
    // Either origin is remote OR image is absolute URL
    return resolveUrl(element.image, document.baseURI);
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
    if (isAbsoluteUrl(image)) {
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
