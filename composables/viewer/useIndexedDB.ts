import { IndexedDB } from '~/composables/utils/idb';

export const indexedDBProvider = Symbol(
  'indexedDBProvider',
) as InjectionKey<IndexedDB>;

export function useIndexedDB(): IndexedDB | undefined {
  return inject(indexedDBProvider);
}
