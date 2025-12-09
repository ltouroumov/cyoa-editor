import Dexie, { type EntityTable, type Transaction } from 'dexie';

import type {
  EditorProject,
  EditorProjectVersion,
} from '~/composables/shared/tables/editor_projects';
import type { SavedBuildData } from '~/composables/shared/tables/viewer_builds';
import type { ViewerProjectCache } from '~/composables/shared/tables/viewer_projects';

export const DexieProvider = Symbol('DexieProvider') as InjectionKey<AppDb>;

export class AppDb extends Dexie {
  viewer_builds!: EntityTable<SavedBuildData, 'id'>;
  viewer_projects_cache!: EntityTable<ViewerProjectCache, 'id'>;

  editor_projects!: EntityTable<EditorProject, 'id'>;
  editor_projects_versions!: EntityTable<EditorProjectVersion, 'id'>;

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

    this.version(3)
      .stores({
        viewer_builds: '++id, name',
        viewer_projects_cache: '++id, title',

        editor_projects: '++id, name',
        editor_projects_versions: '++id, projectId',
      })
      .upgrade(async (tx) => {
        await renameTable(tx, 'builds', 'viewer_builds');
        await renameTable(tx, 'projects', 'editor_projects');
        await renameTable(tx, 'projects_versions', 'editor_projects_versions');
      });
  }
}

async function renameTable(
  tx: Transaction,
  oldName: string,
  newName: string,
): Promise<void> {
  const oldItems = await tx.table(oldName).toArray();
  await tx.table(newName).bulkPut(oldItems);
}

export function createDexie(): AppDb {
  return new AppDb();
}

export function useDexie(): AppDb {
  return inject(DexieProvider)!;
}
