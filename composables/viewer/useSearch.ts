import { map } from 'ramda';
import { Subject } from 'rxjs';
import { match } from 'ts-pattern';

import SearchWorker from './search/worker?worker';

import type {
  ObjAddon,
  ProjectObj,
  ProjectRow,
} from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { sleep } from '~/composables/utils/sleep';
import type {
  SearchEvent,
  WorkerSearchResult,
} from '~/composables/viewer/search/types';

export function useSearch() {
  const { getRow, getObject, getObjectAddon } = useProjectStore();
  const { project } = useProjectRefs();
  const searchText = ref<string>('');
  const searchResults = ref<SearchResult[]>([]);
  const searchResultCount = ref<number>(0);
  const searchLoading = ref<boolean>(false);

  // WebWorker infrastructure
  const worker = ref<Worker | null>(null);
  const workerData = new Subject<any>();

  async function initSearchWorker() {
    if (worker.value) return;
    worker.value = new SearchWorker();
    worker.value.addEventListener('message', (event) => {
      workerData.next(event.data);
    });

    publishSync({
      type: 'init',
      project: project.value!.data,
    });
  }

  function closeSearchWorker() {
    if (!worker.value) return;
    worker.value.terminate();
  }

  function publishSync(event: SearchEvent): void {
    if (!worker.value) {
      throw new Error('Worker not initialized');
    }
    worker.value.postMessage({ event: JSON.stringify(event) });
  }

  async function publishAsync<T>(event: SearchEvent): Promise<T> {
    if (!worker.value)
      return Promise.reject(new Error('Worker not initialized'));
    const replyTo = crypto.randomUUID();
    worker.value.postMessage({ event: JSON.stringify(event), replyTo });

    return new Promise((resolve, reject) => {
      const _sub = workerData.subscribe({
        next: (data) => {
          if (data.replyTo === replyTo) {
            resolve(JSON.parse(data.message));
            _sub.unsubscribe();
          }
        },
        error: (err) => {
          reject(err);
          _sub.unsubscribe();
        },
        complete: () => {
          reject(new Error('Worker completed without reply'));
          _sub.unsubscribe();
        },
      });
    });
  }

  async function runSearchAsync() {
    const { results, count } = await publishAsync<{
      results: WorkerSearchResult[];
      count: number;
    }>({
      type: 'search',
      query: searchText.value,
    });

    searchResultCount.value = count;
    searchResults.value = map((result: WorkerSearchResult): SearchResult => {
      return match(result)
        .with({ type: 'object' }, ({ rowId, objId }): SearchResult => {
          const row = getRow(rowId);
          const obj = getObject(objId);
          return {
            type: 'object',
            key: objId,
            row: row,
            obj: obj,
          };
        })
        .with({ type: 'addon' }, ({ rowId, objId, addonId }): SearchResult => {
          const row = getRow(rowId);
          const obj = getObject(objId);
          const addon = getObjectAddon(objId, addonId);
          return {
            type: 'addon',
            row: row,
            obj: obj,
            addon: addon!.data,
            index: addon!.index,
            key: `${objId}:${addonId}`,
          };
        })
        .exhaustive();
    }, results);
  }

  async function updateResults() {
    if (!project.value) return;

    searchLoading.value = true;
    await nextTick();
    await Promise.all([runSearchAsync(), sleep(400)]);

    searchLoading.value = false;
  }

  return {
    searchText,
    searchResults,
    searchResultCount,
    searchLoading,
    updateResults,
    initSearchWorker,
    closeSearchWorker,
  };
}

export type SearchResult =
  | { type: 'object'; key: string; row: ProjectRow; obj: ProjectObj }
  | {
      type: 'addon';
      key: string;
      row: ProjectRow;
      obj: ProjectObj;
      addon: ObjAddon;
      index: number;
    };
