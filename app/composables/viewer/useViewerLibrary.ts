import {
  append,
  clone,
  concat,
  indexBy,
  isNil,
  isNotNil,
  keys,
  mergeLeft,
  mergeRight,
  omit,
  prop,
  propEq,
  uniq,
  values,
} from 'ramda';
import { match } from 'ts-pattern';
import { onScopeDispose } from 'vue';

import type { Project } from '~/composables/project/types/v1';
import type {
  CacheItem,
  ViewerProjectCache,
} from '~/composables/shared/tables/viewer_projects';
import { useDexie } from '~/composables/shared/useDexie';
import { useLiveQuery } from '~/composables/shared/useLiveQuery';
import { useProjectStore } from '~/composables/store/project';
import { useViewerRefs } from '~/composables/store/viewer';
import { bufferToString, readFileContents } from '~/composables/utils';
import { resolveUrl } from '~/composables/utils/url';
import type {
  CacheOptions,
  CacheResult,
  ClearOptions,
  ClearResult,
} from '~/composables/viewer/cache/types';
import { useCacheWorker } from '~/composables/viewer/cache/useCacheWorker';
import { downloadFile, formatBytes } from '~/composables/viewer/cache/utils';
import type {
  LibraryData,
  ProjectListEntry,
  ViewerProject,
} from '~/composables/viewer/types';

type CacheOperationStatus =
  | { status: 'running'; progress?: string }
  | { status: 'completed' }
  | { status: 'cancelled' }
  | { status: 'failure'; error: string };

export type CacheOperation = {
  projectId: string;
  taskId: string;
  keys: string[];
  name: string;
} & CacheOperationStatus;

type Subscription = { unsubscribe: () => void };

const CLEANUP_DELAY_SUCCESS = 3000;
const CLEANUP_DELAY_FAILURE = 10000;

export function useViewerLibrary() {
  const dexie = useDexie();
  const worker = useCacheWorker();
  const { librarySettings, remoteProjectList } = useViewerRefs();
  const $store = useProjectStore();

  const cacheOperations = ref<CacheOperation[]>([]);
  const subscriptions: Subscription[] = [];
  let isDisposed = false;

  const performCleanup = () => {
    // Kill the worker
    worker.closeWorker();
    // Clear subscriptions
    subscriptions.forEach((sub) => sub.unsubscribe());
  };

  const checkAndCleanup = () => {
    if (!isDisposed) return;

    // Check if there are any running tasks left
    const hasRunningTasks = cacheOperations.value.some(
      (op) => op.status === 'running',
    );

    if (!hasRunningTasks) {
      performCleanup();
    } else {
      // Check again after a short delay
      setTimeout(() => checkAndCleanup(), 1000);
    }
  };

  onScopeDispose(() => {
    isDisposed = true;

    // Cancel all running tasks
    cacheOperations.value.forEach((op) => {
      if (op.status === 'running') {
        worker.publishSync({ type: 'abort', taskId: op.taskId });
      }
    });

    checkAndCleanup();
  });

  const startOperation = (
    taskId: string,
    projectId: string,
    keys: string[],
    name: string,
  ): void => {
    cacheOperations.value = append(
      { status: 'running', taskId, projectId, keys, name },
      cacheOperations.value,
    );
  };
  const updateOperation = (
    taskId: string,
    status: CacheOperationStatus,
  ): void => {
    cacheOperations.value = cacheOperations.value.map((op) =>
      op.taskId === taskId ? mergeRight(op, status) : op,
    );
  };
  const clearOperation = (taskId: string): void => {
    cacheOperations.value = cacheOperations.value.filter(
      (op) => op.taskId !== taskId,
    );
  };

  const scheduleCleanup = (
    taskId: string,
    delay: number = CLEANUP_DELAY_SUCCESS,
  ) => {
    setTimeout(() => {
      clearOperation(taskId);
    }, delay);
  };
  const hasActiveOperation = (projectId: string, key: string) => {
    return hasActiveOperation0(cacheOperations.value, projectId, key);
  };

  const localProjectList = useLiveQuery<ViewerProject[]>(() => {
    return dexie.viewer_projects_cache.toArray();
  });

  const projectList = computed(() => {
    // index the projects by ID
    const localProjectList0 = localProjectList.value || [];
    const remoteProjectList0 = remoteProjectList.value || [];
    const localProjects = indexBy(prop('id'), localProjectList0);
    const remoteProjects = indexBy(prop('id'), remoteProjectList0);
    // compute the union of the two indexes
    const allProjectIds = uniq(
      concat(keys(localProjects), keys(remoteProjects)),
    );
    // build the list of projects
    return allProjectIds
      .map((id): ProjectListEntry => {
        const localProject = localProjects[id];
        const remoteProject = remoteProjects[id];
        if (isNil(remoteProject)) {
          return mergeLeft(localProject, { source: 'local' as const });
        } else if (isNil(localProject)) {
          return mergeLeft(remoteProject, { source: 'remote' as const });
        } else {
          const projectInfo = mergeLeft(remoteProject, localProject);
          return mergeLeft(projectInfo, { source: 'cached' as const });
        }
      })
      .toSorted((a, b) => {
        // local-only projects should be listed first
        if (a.source === 'local' && b.source !== 'local') return -1;
        if (a.source !== 'local' && b.source === 'local') return 1;
        // cached projects should be listed next
        if (a.source === 'cached' && b.source !== 'cached') return -1;
        if (a.source !== 'cached' && b.source === 'cached') return 1;
        // remote-only projects should be listed last
        if (a.source === 'remote' && b.source !== 'remote') return 1;
        if (a.source !== 'remote' && b.source === 'remote') return -1;

        if (a.source === b.source && a.source === 'remote') {
          const aIndex = remoteProjectList0?.findIndex(propEq(a.id, 'id'));
          const bIndex = remoteProjectList0?.findIndex(propEq(b.id, 'id'));
          // preserve the order of the remote projects in the list
          return aIndex - bIndex;
        } else {
          // sort by title when the sources are the same
          return a.title.localeCompare(b.title);
        }
      });
  });

  const getProject = (id: string): ProjectListEntry | undefined => {
    return projectList.value.find(propEq(id, 'id'));
  };

  const createLocalProject = async (
    data: string,
  ): Promise<ViewerProjectCache> => {
    const projectData = JSON.parse(data) as Project;
    const projectId = projectData.$projectId ?? `local-${crypto.randomUUID()}`;
    const projectTitle = projectData.rows[0].title;

    let project0 = await dexie.viewer_projects_cache.get(projectId);
    if (isNil(project0)) {
      project0 = await dexie.viewer_projects_cache
        .where({ title: projectTitle, origin: 'local' })
        .first();
    }

    let project: ViewerProjectCache;
    if (isNil(project0)) {
      project = {
        id: projectId,
        title: projectTitle,
        file_url: `file://${projectId}.json`,
        cachedAt: new Date(),
        origin: 'local',
      };
    } else {
      // Update the date
      project = mergeRight(project0, {
        title: projectTitle,
        cachedAt: new Date(),
      });
    }

    await dexie.viewer_projects_cache.put(project);

    const fsHandle = await navigator.storage.getDirectory();
    const projectDir = await fsHandle.getDirectoryHandle(projectId, {
      create: true,
    });
    const projectFile = await projectDir.getFileHandle('project.json', {
      create: true,
    });
    // Write the project file contents to the cache directory
    const projectFileHandle = await projectFile.createWritable();
    try {
      await projectFileHandle.truncate(0);
      await projectFileHandle.write(data);
    } finally {
      await projectFileHandle.close();
    }

    return project;
  };

  const addProject = async (file: File, load?: boolean) => {
    // Load the file contents into memory
    const data = await readFileContents(file);
    // Add the project to the local projects list
    const project = await createLocalProject(data);

    if (load) {
      // Load the project into the viewer
      await $store.loadProject(async (setProgress) => {
        await setProgress(`Loading ${project.title} ...`);
        return {
          fileContents: data,
          fileName: file.name,
          local: true,
          projectId: project.id,
          origin: 'local',
        };
      });
    }
  };

  const loadProject = async (id: string) => {
    const project = projectList.value.find(propEq(id, 'id'));
    if (!project) return; // project not found

    if (project.source === 'remote') {
      await loadRemoteFile(project);
    } else if (project.source === 'cached' || project.source === 'local') {
      await loadCachedProject(project);
    }
  };

  const cacheProject = async (
    id: string,
    options: CacheOptions,
  ): Promise<void> => {
    const project = projectList.value.find(propEq(id, 'id'));
    if (!project) return; // project not found

    if (project.source === 'local') {
      // For local projects, we only support caching images (as the project file is already local)
      if (!options.images) return;
      options.project = false;
    }

    options.isOriginLocal = project.origin === 'local';
    const resolvedFileUrl = resolveUrl(project.file_url, document.baseURI);
    const projectWithResolvedUrl = { ...project, file_url: resolvedFileUrl };

    const { taskId, events } = await worker.submitTask({
      type: 'cache',
      project: projectWithResolvedUrl,
      options,
      baseUrl: document.baseURI,
    });

    const keys = [
      (options.project ?? true) ? 'project' : null,
      options.images === true ? 'images' : null,
      ...(Array.isArray(options.images)
        ? options.images.map((i) => `images.${i}`)
        : []),
    ].filter(isNotNil) as string[];

    const name =
      (options.project ?? true) ? 'Download project' : 'Download images';

    startOperation(taskId, project.id, keys, name);

    const updateProjectCacheState = async (
      projectId: string,
      newItems: CacheItem[] = [],
    ) => {
      const modifications = await dexie.viewer_projects_cache
        .where('id')
        .equals(projectId)
        .modify((p) => {
          const baseCachedItems = p.cachedItems ?? [];
          const mergedCachedItems = values(
            mergeRight(
              indexBy(prop('rowId'), baseCachedItems),
              indexBy(prop('rowId'), newItems),
            ),
          );
          p.cachedItems = mergedCachedItems;
          p.cachedAt = new Date();
        });

      if (modifications === 0) {
        // deep clone the project otherwise it will contain vue proxy objects :/
        const rawProject = clone(project);
        await dexie.viewer_projects_cache.put({
          ...omit(['source', 'origin'], rawProject),
          origin: 'remote',
          cachedAt: new Date(),
          cachedItems: newItems,
        });
      }
    };

    // read the stream of messages from the worker until the cache operation is complete
    const subscription = events.subscribe(async (msg: CacheResult) => {
      subscriptions.push(subscription);
      await match(msg)
        .with({ status: 'progress' }, async (progress) => {
          updateOperation(progress.taskId, {
            status: 'running',
            progress: progress.info,
          });
        })
        .with({ status: 'completed' }, async (event) => {
          await updateProjectCacheState(project.id, event.cachedItems);

          updateOperation(event.taskId, {
            status: 'completed',
          });
          scheduleCleanup(event.taskId, CLEANUP_DELAY_SUCCESS);
        })
        .with({ status: 'cancelled' }, async (event) => {
          console.log(
            `[useViewerLibrary] Received cancelled event for ${event.taskId}`,
            event,
          );
          if (event.cachedItems) {
            await updateProjectCacheState(project.id, event.cachedItems);
          }

          updateOperation(event.taskId, {
            status: 'cancelled',
          });
          subscription.unsubscribe();
          scheduleCleanup(event.taskId, CLEANUP_DELAY_SUCCESS);
        })
        .with({ status: 'failure' }, async (event) => {
          updateOperation(event.taskId, {
            status: 'failure',
            error: event.error,
          });
          scheduleCleanup(event.taskId, CLEANUP_DELAY_FAILURE);
        })
        .exhaustive()
        .catch((err) => {
          console.error('failed to process event', msg, err);
        })
        .finally(() => {
          checkAndCleanup();
        });
    });
  };

  const abortCache = async (taskId: string) => {
    worker.publishSync({ type: 'abort', taskId });
  };

  const clearCache = async (
    id: string,
    options: ClearOptions,
  ): Promise<void> => {
    const project = projectList.value.find(propEq(id, 'id'));
    if (!project) return; // project not found

    if (project.source === 'local' && options.project) {
      await dexie.viewer_projects_cache.delete(project.id);
      const fsHandle = await navigator.storage.getDirectory();
      await fsHandle.removeEntry(project.id, { recursive: true }).catch((e) => {
        // ignore
      });
    } else if (
      project.source === 'cached' ||
      (project.source === 'local' && options.images)
    ) {
      const resolvedFileUrl = resolveUrl(project.file_url, document.baseURI);
      const projectWithResolvedUrl = { ...project, file_url: resolvedFileUrl };

      const { taskId, events } = await worker.submitTask({
        type: 'clear',
        project: projectWithResolvedUrl,
        options,
        baseUrl: document.baseURI,
      });
      const keys = [
        (options.project ?? true) ? 'project' : null,
        options.images === true ? 'images' : null,
        ...(Array.isArray(options.images)
          ? options.images.map((i) => `images.${i}`)
          : []),
      ].filter(isNotNil) as string[];
      const name = (options.project ?? true) ? 'Clear project' : 'Clear images';
      startOperation(taskId, project.id, keys, name);
      // read the stream of messages from the worker until the cache operation is complete
      const subscription = events.subscribe(async (msg: ClearResult) => {
        subscriptions.push(subscription);

        await match(msg)
          .with({ status: 'progress' }, async (progress) => {
            updateOperation(progress.taskId, {
              status: 'running',
              progress: progress.info,
            });
          })
          .with({ status: 'completed' }, async (event) => {
            const { deletedProject, deletedAllImages, deletedCacheItems } =
              event;

            if (deletedProject) {
              await dexie.viewer_projects_cache.delete(id);
            } else {
              await dexie.viewer_projects_cache
                .where('id')
                .equals(id)
                .modify((p) => {
                  if (deletedAllImages) {
                    // Remove all image entries
                    p.cachedItems = (p.cachedItems || []).filter(
                      (item) => item.type !== 'images.row',
                    );
                  } else if (deletedCacheItems) {
                    // Remove specific images
                    p.cachedItems = (p.cachedItems || [])
                      .map((item) => {
                        if (
                          item.type === 'images.row' &&
                          deletedCacheItems.includes(item.rowId)
                        ) {
                          return { ...item, count: 0, size: 0 };
                        }
                        return item;
                      })
                      .filter((item) => item.count > 0);
                  }
                });
            }
            updateOperation(event.taskId, { status: 'completed' });
            scheduleCleanup(event.taskId, CLEANUP_DELAY_SUCCESS);
          })
          .with({ status: 'failure' }, async (event) => {
            updateOperation(event.taskId, {
              status: 'failure',
              error: event.error,
            });
            scheduleCleanup(event.taskId, CLEANUP_DELAY_FAILURE);
          })
          .exhaustive()
          .catch((err) => {
            console.error('failed to process clear event', msg, err);
          })
          .finally(() => {
            checkAndCleanup();
          });
      });
    }
  };

  const loadRemoteFile = async (project: ViewerProject) => {
    const fileURL = resolveUrl(project.file_url, document.baseURI);
    if (!fileURL) return;

    await $store.loadProject(async (setProgress) => {
      const result = await downloadFile(fileURL, async (progress) => {
        if (progress.type === 'stream') {
          await setProgress(`Downloaded ${formatBytes(progress.bytes)}`);
        } else if (progress.type === 'decode') {
          await setProgress(
            `Decoding ${formatBytes(progress.bytes)}/${formatBytes(progress.total)}`,
          );
        }
      });
      if ('error' in result) {
        throw new Error(`Failed to download ${project.file_url}`);
      } else {
        return {
          projectId: project.id,
          fileContents: bufferToString(result.data.buffer),
          fileName: fileURL.toString(),
          origin: 'remote',
        };
      }
    });
  };

  const loadCachedProject = async (
    project: ProjectListEntry,
  ): Promise<void> => {
    await $store.loadProject(async (setProgress) => {
      await setProgress(`Loading ${project.title} ...`);
      const fileContents = await loadCachedData(project);
      return {
        projectId: project.id,
        fileContents: fileContents,
        fileName: project.file_url,
        local: true,
        origin: project.origin,
      };
    });
  };

  const loadCachedData = async (project: ViewerProject) => {
    const fsHandle = await navigator.storage.getDirectory();
    // Create a directory to cache the project files
    const projectDir = await fsHandle.getDirectoryHandle(project.id, {
      create: true,
    });

    const projectFile = await projectDir.getFileHandle('project.json', {
      create: true,
    });

    const handle = await projectFile.getFile();
    const buffer = await handle.arrayBuffer();
    return bufferToString(buffer);
  };

  return {
    projectList,
    remoteProjectList,
    librarySettings,
    cacheOperations,
    hasActiveOperation,
    clearOperation,
    // methods
    getProject,
    addProject,
    loadProject,
    cacheProject,
    abortCache,
    clearCache,

    loadCachedData,
  };
}

export async function setupLibrary() {
  const library = useViewerLibrary();
  const _config = useRuntimeConfig();
  const { data: response } = await useAsyncData(
    'projects',
    async (): Promise<LibraryData> => {
      // Fetch the local project list
      const library = await $fetch<LibraryData>(
        `${_config.app.baseURL}config/viewer/projects.json`,
      );

      // Fetch the remote project list
      if (library.remote) {
        const remote = await $fetch<LibraryData>(library.remote);
        library.items = concat(library.items, remote.items);
      }

      // Fetch the remote project lists
      for (const remoteUrl of library.remotes || []) {
        const remote = await $fetch<LibraryData>(remoteUrl);
        library.items = concat(library.items, remote.items);
      }

      return library;
    },
  );

  if (isNotNil(response.value)) {
    library.remoteProjectList.value = response.value.items;
    library.librarySettings.value = omit(['items'], response.value);
  }
}

export const hasActiveOperation0 = (
  cacheOperations: CacheOperation[],
  projectId: string,
  key: string,
) => {
  return cacheOperations.some(
    (op) =>
      op.projectId === projectId &&
      op.keys.includes(key) &&
      op.status === 'running',
  );
};
