import * as R from 'ramda';
import { clone, isNotEmpty } from 'ramda';

import {
  getProjectInfo,
  getSelectedItems,
} from '~/components/viewer/utils/build';
import type {
  SavedBuildData,
  SavedBuildFolder,
  SavedBuildItem,
} from '~/components/viewer/utils/types';
import {
  type Selections,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';
import { useDexie } from '~/composables/viewer/useDexie';

type UpdateBuildOptions = Partial<Omit<SavedBuildData, 'id'>> & {
  $choices?: boolean;
  $notes?: boolean;
};

export function useBuildLibrary() {
  const db = useDexie()!;

  const { setSelected } = useProjectStore();
  const $store = useProjectRefs();

  const loadFolders = async (parent?: number): Promise<SavedBuildFolder[]> => {
    return db.folders
      .where('parent')
      .equals(parent ?? 0)
      .toArray();
  };

  const saveFolder = async (
    name: string,
    parent: number,
  ): Promise<SavedBuildFolder> => {
    const entry: Omit<SavedBuildFolder, 'id'> = {
      name: name,
      parent: parent,
    };

    const entryId = await db.folders.add(entry);
    return R.assoc('id', entryId, entry);
  };

  const loadBuilds = async (folder?: number): Promise<SavedBuildData[]> => {
    return db.builds
      .where('folder')
      .equals(folder ?? 0)
      .toArray();
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
      folder: 0,
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

  return {
    loadFolders,
    saveFolder,
    loadBuilds,
    loadBuild,
    saveBuild,
    updateBuild,
    deleteBuild,
  };
}
