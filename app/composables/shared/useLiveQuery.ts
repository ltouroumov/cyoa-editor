import { useObservable } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';

export const useLiveQuery = <T>(fn: () => T | Promise<T>) =>
  useObservable<T>(from(liveQuery(fn)));
