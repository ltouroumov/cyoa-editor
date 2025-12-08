import {
  concat,
  indexBy,
  isNil,
  isNotNil,
  keys,
  mergeLeft,
  omit,
  prop,
  propEq,
  uniq,
} from 'ramda';
import { match } from 'ts-pattern';

import type { ViewerProjectCacheFields } from '~/composables/shared/tables/viewer_projects';
import { useDexie } from '~/composables/shared/useDexie';
import { useLiveQuery } from '~/composables/shared/useLiveQuery';
import { useProjectStore } from '~/composables/store/project';
import { useViewerRefs } from '~/composables/store/viewer';
import { bufferToString } from '~/composables/utils';
import type { CacheResult } from '~/composables/viewer/cache/types';
import { useCacheWorker } from '~/composables/viewer/cache/useCacheWorker';
import { downloadFile, formatBytes } from '~/composables/viewer/cache/utils';
import type { LibraryData, ViewerProject } from '~/composables/viewer/types';

type ProjectListEntry = ViewerProject &
  Partial<ViewerProjectCacheFields> & {
    source: 'local' | 'remote' | 'cached';
  };

type CacheOperation =
  | { status: 'idle' }
  | ({ projectId: string } & (
      | { status: 'running'; progress?: string }
      | { status: 'completed' }
      | { status: 'cancelled' }
      | { status: 'failure'; error: string }
    ));

export function useViewerLibrary() {
  const dexie = useDexie();
  const worker = useCacheWorker();
  const { librarySettings, remoteProjectList } = useViewerRefs();
  const { loadProject } = useProjectStore();

  const cacheOperation = ref<CacheOperation>({ status: 'idle' });

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

  const cacheProject = async (id: string, refresh?: boolean) => {
    const project = projectList.value.find(propEq(id, 'id'));
    if (!project) return; // project not found

    if (project.source === 'local') {
      return; // nothing to do for local projects
    } else {
      cacheOperation.value = { status: 'running', projectId: project.id };

      // cache the project using the cache worker
      await worker.initWorker();
      worker.publishSync({ type: 'cache', project: project, refresh });
      // read the stream of messages from the worker until the cache operation is complete
      const _sub = worker.messages.subscribe(async (msg: CacheResult) => {
        await match(msg)
          .with({ status: 'progress' }, async (progress) => {
            cacheOperation.value = {
              status: 'running',
              progress: progress.info,
              projectId: project.id,
            };
          })
          .with({ status: 'completed' }, async () => {
            await dexie.viewer_projects_cache.put({
              ...omit(['source'], project),
              cachedAt: new Date(),
            });

            cacheOperation.value = {
              status: 'completed',
              projectId: project.id,
            };
            _sub.unsubscribe();
          })
          .with({ status: 'cancelled' }, async () => {
            cacheOperation.value = {
              status: 'cancelled',
              projectId: project.id,
            };
            _sub.unsubscribe();
          })
          .with({ status: 'failure' }, async ({ error }) => {
            cacheOperation.value = {
              status: 'failure',
              projectId: project.id,
              error,
            };
            _sub.unsubscribe();
          })
          .exhaustive();
      });
    }
  };

  const abortCache = async () => {
    worker.publishSync({ type: 'abort' });
  };

  const clearCache = async (id: string) => {};

  const loadRemoteFile = async (project: ViewerProject) => {
    const fileURL = project.file_url;
    if (!fileURL) return;

    await loadProject(async (setProgress) => {
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
          fileContents: bufferToString(result.data.buffer),
          fileName: fileURL.toString(),
        };
      }
    });
  };

  return {
    projectList,
    remoteProjectList,
    librarySettings,
    cacheOperation,
    // methods
    loadRemoteFile,
    cacheProject,
    abortCache,
    clearCache,
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
