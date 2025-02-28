import Dexie, { type EntityTable } from 'dexie';

import type {
  SavedBuildData,
  SavedBuildFolder,
} from '~/components/viewer/utils/types';

export const DexieProvider = Symbol('DexieProvider') as InjectionKey<AppDb>;

export class AppDb extends Dexie {
  builds!: EntityTable<SavedBuildData, 'id'>;
  folders!: EntityTable<SavedBuildFolder, 'id'>;

  constructor() {
    super('cyoa-editor');
    this.version(3)
      .stores({
        builds: '++id, name, folder',
        folders: '++id, name, parent',
      })
      .upgrade(async (tx) => {
        await tx
          .table('builds')
          .toCollection()
          .modify((build) => {
            build.folder = build.folder ?? 0;
          });
      });
  }
}

export function createDexie(): AppDb {
  return new AppDb();
}

export function useDexie(): AppDb {
  return inject(DexieProvider)!;
}
