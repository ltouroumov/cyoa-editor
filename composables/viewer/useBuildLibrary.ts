import * as R from 'ramda';
import { clone, isNotEmpty } from 'ramda';

import {
  getProjectInfo,
  getSelectedItems,
} from '~/components/viewer/utils/build';
import type {
  SavedBuildData,
  SavedBuildItem,
} from '~/components/viewer/utils/types';
import {
  type Selections,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';
import { useIndexedDB } from '~/composables/viewer/useIndexedDB';

type UpdateBuildOptions = Partial<Omit<SavedBuildData, 'id'>> & {
  $choices?: boolean;
  $notes?: boolean;
};

export function useBuildLibrary() {
  const db = useIndexedDB()!;

  const { setSelected } = useProjectStore();
  const $store = useProjectRefs();

  const loadBuilds = async (): Promise<SavedBuildData[]> => {
    return db.transaction('builds', 'readonly', async (tx) => {
      const store = tx.objectStore('builds');
      return store.getAll();
    });
  };

  const saveBuild = async (buildName: string): Promise<SavedBuildData> => {
    return db.transaction('builds', 'readwrite', async (tx) => {
      const table = tx.objectStore('builds');
      const today = new Date();
      const entry: Omit<SavedBuildData, 'id'> = {
        name: buildName,
        createdAt: today,
        updatedAt: today,
        project: getProjectInfo($store.store.value),
        groups: getSelectedItems(
          $store.selected.value,
          $store.backpack.value,
          $store.getObject.value,
          $store.getObjectRow.value,
          $store.getRow.value,
        ),
        notes: clone($store.buildNotes.value),
      };
      const entryId = await table.add(entry);
      const savedEntry: SavedBuildData = {
        ...entry,
        id: entryId,
      };

      return savedEntry;
    });
  };

  const updateBuild = async (
    build: SavedBuildData,
    { $notes, $choices, ...rest }: UpdateBuildOptions = {},
  ): Promise<SavedBuildData> => {
    // Do not accidentally write an empty build
    if ($choices && R.isEmpty($store.selected.value)) {
      return build;
    }

    return db.transaction('builds', 'readwrite', async (tx) => {
      const table = tx.objectStore('builds');

      const entry: SavedBuildData = clone(build);
      entry.updatedAt = new Date();

      console.log('props', rest);
      if (isNotEmpty(rest)) {
        // Copy the updated properties into the object
        Object.assign(entry, rest);
      }
      if ($notes) {
        entry.notes = clone($store.buildNotes.value);
      }
      if ($choices) {
        entry.project = getProjectInfo($store.store.value);
        entry.groups = getSelectedItems(
          $store.selected.value,
          $store.backpack.value,
          $store.getObject.value,
          $store.getObjectRow.value,
          $store.getRow.value,
        );
      }
      await table.put(entry);

      return entry;
    });
  };

  const deleteBuild = async (build: SavedBuildData) => {
    await db.transaction('builds', 'readwrite', async (tx) => {
      const store = tx.objectStore('builds');
      await store.delete(build.id);
    });
  };

  const loadBuild = (build: SavedBuildData) => {
    if (build.selected) {
      setSelected(build.selected, true, true);
    } else {
      const selections: Selections = R.reduceRight(
        (sel: SavedBuildItem, acc: Selections) =>
          R.assoc(sel.objId, sel.count, acc),
        {},
        R.chain(R.prop('items'), build.groups),
      );
      setSelected(selections, true, true);
    }

    $store.buildNotes.value = build.notes ?? {};
    $store.buildData.value = build;
    $store.buildModified.value = false;
  };

  return { loadBuilds, loadBuild, saveBuild, updateBuild, deleteBuild };
}
