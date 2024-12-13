import * as R from 'ramda';
import { clone, isNotEmpty } from 'ramda';

import {
  getProjectInfo,
  getSelectedItems,
} from '~/components/viewer/utils/build';
import type {
  SavedBuildData,
  SavedBuildItem,
} from '~/composables/shared/tables/builds';
import { useDexie } from '~/composables/shared/useDexie';
import {
  type Selections,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';

type UpdateBuildOptions = Partial<Omit<SavedBuildData, 'id'>> & {
  $choices?: boolean;
  $notes?: boolean;
};

export function useBuildLibrary() {
  const db = useDexie()!;

  const { setSelected } = useProjectStore();
  const $store = useProjectRefs();

  const loadBuilds = async (): Promise<SavedBuildData[]> => {
    return db.builds.toArray();
  };

  const saveBuild = async (buildName: string): Promise<SavedBuildData> => {
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
    const entryId = await db.builds.add(entry);
    return R.assoc('id', entryId, entry);
  };

  const updateBuild = async (
    build: SavedBuildData,
    { $notes, $choices, ...rest }: UpdateBuildOptions = {},
  ): Promise<SavedBuildData> => {
    // Do not accidentally write an empty build
    if ($choices && R.isEmpty($store.selected.value)) {
      return build;
    }

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
    await db.builds.put(entry);

    return entry;
  };

  const deleteBuild = async (build: SavedBuildData) => {
    await db.builds.delete(build.id);
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
