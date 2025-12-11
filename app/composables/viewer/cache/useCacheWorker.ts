import type { Observable } from 'rxjs';
import { Subject, filter } from 'rxjs';

import CacheWorker from './worker?worker';

import type {
  CacheEvent,
  CacheResult,
  CacheTask,
  ClearResult,
  ClearTask,
} from '~/composables/viewer/cache/types';

export function useCacheWorker() {
  // WebWorker infrastructure
  const worker = ref<Worker | null>(null);
  const workerData = new Subject<any>();

  async function initWorker() {
    if (worker.value) return;
    try {
      worker.value = new CacheWorker();
      worker.value.addEventListener('message', (event) => {
        workerData.next(event.data);
      });

      publishSync({ type: 'init' });
    } catch (e) {
      console.log('initSearchWorker', e);
    }
  }

  async function closeWorker() {
    if (!worker.value) return;
    worker.value.terminate();
  }

  function publishSync(event: CacheEvent): void {
    if (!worker.value) {
      throw new Error('Worker not initialized');
    }
    try {
      worker.value.postMessage({ event: JSON.stringify(event) });
    } catch (e) {
      console.log('publishSync', e);
    }
  }

  async function publishAsync<T>(event: CacheEvent): Promise<T> {
    if (!worker.value) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    const replyTo = crypto.randomUUID();
    try {
      worker.value.postMessage({ event: JSON.stringify(event), replyTo });
    } catch (e) {
      console.log('publishAsync', e);
    }

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

  async function submitTask(
    task: CacheTask,
  ): Promise<{ taskId: string; events: Observable<CacheResult> }>;
  async function submitTask(
    task: ClearTask,
  ): Promise<{ taskId: string; events: Observable<ClearResult> }>;

  async function submitTask(task: CacheTask | ClearTask): Promise<{
    taskId: string;
    events: Observable<CacheResult | ClearResult>;
  }> {
    await initWorker();
    const taskId = crypto.randomUUID();
    const event: CacheEvent = { taskId, ...task };
    publishSync(event);

    const events = workerData.pipe(
      filter((data) => data.taskId === event.taskId),
    ) as Observable<CacheResult>;
    return { taskId, events };
  }

  return {
    initWorker,
    closeWorker,
    publishSync,
    publishAsync,
    submitTask,
    messages: workerData,
  };
}
