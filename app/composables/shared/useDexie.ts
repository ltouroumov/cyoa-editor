import Dexie, { type EntityTable } from 'dexie';

import type { SavedBuildData } from '~/composables/shared/tables/builds';
import type {
  EditorProject,
  EditorProjectVersion,
} from '~/composables/shared/tables/projects';

export const DexieProvider = Symbol('DexieProvider') as InjectionKey<AppDb>;

export class AppDb extends Dexie {
  builds!: EntityTable<SavedBuildData, 'id'>;
  projects!: EntityTable<EditorProject, 'id'>;
  projects_versions!: EntityTable<EditorProjectVersion, 'id'>;

  constructor() {
    super('cyoa-editor');
    this.version(1).stores({
      builds: '++id',
    });

    this.version(2).stores({
      builds: '++id, name',
      projects: '++id, name',
      projects_versions: '++id, projectId',
    });
  }
}

export function createDexie(): AppDb {
  return new AppDb();
}

export function useDexie(): AppDb {
  return inject(DexieProvider)!;
}
