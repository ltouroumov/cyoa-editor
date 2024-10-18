import Dexie, { type EntityTable } from 'dexie';

import type { SavedBuildData } from '~/components/viewer/utils/types';

export const DexieProvider = Symbol('DexieProvider') as InjectionKey<AppDb>;

export class AppDb extends Dexie {
  builds!: EntityTable<SavedBuildData, 'id'>;

  constructor() {
    super('cyoa-editor');
    this.version(1).stores({
      builds: '++id',
    });
  }
}

export function createDexie(): AppDb {
  return new AppDb();
}

export function useDexie(): AppDb {
  return inject(DexieProvider)!;
}
