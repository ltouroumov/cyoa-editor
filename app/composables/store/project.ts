import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';
import { findIndex, isNil } from 'ramda';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { buildConditions } from '~/composables/conditions';
import type {
  LoadingProjectStore,
  ObjAddon,
  PointType,
  Project,
  ProjectFile,
  ProjectNote,
  ProjectObj,
  ProjectRow,
  ProjectStore,
} from '~/composables/project/types/v1';
import type {
  EditorProject,
  EditorProjectVersion,
} from '~/composables/shared/tables/editor_projects';
import type { SavedBuildData } from '~/composables/shared/tables/viewer_builds';
import { bufferToHex, stringToBuffer } from '~/composables/utils';

export type Selections = Record<string, number>;
type Transform = (sel: Selections) => Selections;

export type LoadProjectData =
  | {
      fileContents: string;
      fileName: string;
      projectId?: string;
      local?: boolean;
    }
  | {
      project: EditorProject;
      version: EditorProjectVersion;
    };

type SetProgressF = (progress: string) => Promise<void>;
type ProjectProvider = (
  setProgress: SetProgressF,
) => Promise<LoadProjectData | undefined>;

export type IndexMapT = Record<
  string,
  { index: number; objects: Record<string, number> }
>;

export const useProjectStore = defineStore('project', () => {
  const store = shallowRef<ProjectStore>({
    status: 'empty',
  });

  const project = computed<ProjectFile | null>(() => {
    if (store.value.status === 'loaded') return store.value.file;
    else return null;
  });
  const isLocal = computed<boolean>(() => {
    if (store.value.status === 'loaded') return store.value.local;
    else return false;
  });

  const selected = ref<Selections>({});
  const selectedIds = computed(() => R.keys(selected.value));

  const buildData = ref<SavedBuildData | null>(null);
  const buildNotes = ref<Record<string, ProjectNote>>({});
  const buildModified = ref<boolean>(false);

  const backpack: ComputedRef<ProjectRow[]> = computed(
    () => project.value?.data.backpack ?? [],
  );

  const pointTypes: ComputedRef<PointType[]> = computed(
    () => project.value?.data.pointTypes ?? [],
  );

  const projectRows: ComputedRef<ProjectRow[]> = computed(
    () => project.value?.data.rows ?? [],
  );

  const getRow: ComputedRef<(id: string) => ProjectRow> = computed(() => {
    const rows: Record<string, ProjectRow> = R.indexBy(
      R.prop('id'),
      project.value?.data.rows ?? [],
    );

    return (id: string) => rows[id];
  });

  const getObject: ComputedRef<(id: string) => ProjectObj> = computed(() => {
    const objects: Record<string, ProjectObj> = R.indexBy(
      R.prop('id'),
      R.chain(R.prop('objects'), project.value?.data.rows ?? []),
    );

    return (id: string) => objects[id];
  });

  const getObjectAddon = (
    objId: string,
    addonId: string | number,
  ): { index: number; data: ObjAddon } | undefined => {
    const obj = getObject.value(objId);
    if (!obj) return undefined;
    else if (typeof addonId === 'number') {
      return { index: addonId, data: obj.addons[addonId] };
    } else {
      const index = findIndex((addon) => addon.id === addonId, obj.addons);
      return { index, data: obj.addons[index] };
    }
  };

  const getObjectRow: ComputedRef<(id: string) => string> = computed(() => {
    const mapping: Record<string, string> = R.fromPairs(
      R.chain(
        (row: ProjectRow) =>
          R.map(
            (obj: ProjectObj): [string, string] => [obj.id, row.id],
            row.objects,
          ),
        project.value?.data.rows ?? [],
      ),
    );

    return (id: string) => mapping[id];
  });

  const getPointType: ComputedRef<(id: string) => PointType> = computed(() => {
    const pointTypes: Record<string, PointType> = R.indexBy(
      R.prop('id'),
      project.value?.data.pointTypes ?? [],
    );

    return (id: string) => pointTypes[id];
  });

  const indexMap: ComputedRef<IndexMapT> = computed((): IndexMapT => {
    const _project = project.value?.data;
    if (isNil(_project)) return {};

    return R.fromPairs(
      _project.rows.map(
        (
          row: ProjectRow,
          idx0: number,
        ): [string, { index: number; objects: Record<string, number> }] => {
          const objIndexMap = R.fromPairs(
            row.objects.map(
              (obj: ProjectObj, idx1: number): [string, number] => {
                return [obj.id, idx1];
              },
            ),
          );

          return [row.id, { index: idx0, objects: objIndexMap }];
        },
      ),
    );
  });

  const isLoaded = computed(() => !!project.value);

  const loadProject = async (provider: ProjectProvider) => {
    store.value = { status: 'loading' };
    selected.value = {};

    const setProgress = (progress: string): Promise<void> =>
      nextTick(() => {
        (store.value as LoadingProjectStore).progress = progress;
        triggerRef(store);
      });

    try {
      const result = await provider(setProgress);
      if (!result) {
        store.value = { status: 'empty' };
        return;
      }

      if ('fileContents' in result) {
        const { fileContents, fileName } = result;

        const hashBytes = await crypto.subtle.digest(
          'SHA-1',
          stringToBuffer(fileContents),
        );
        const hashHex = bufferToHex(hashBytes);

        const data: Project = JSON.parse(fileContents);
        const projectFile: ProjectFile = {
          data: data,
          fileName: fileName,
          projectId: result.projectId ?? data?.$projectId,
          projectName: data.rows[0].title,
          projectHash: hashHex,
        };

        store.value = {
          status: 'loaded',
          file: projectFile,
          local: result.local ?? false,
        };
        triggerRef(store);
      } else {
        // $toast.error('Failed to load the project :(');
        store.value = { status: 'empty' };
      }
    } catch (e) {
      // $toast.error('Failed to load the project :(');
      console.log(e);
      store.value = { status: 'empty' };
    }
  };
  const unloadProject = () => {
    store.value = { status: 'empty' };
    selected.value = {};
  };

  const setSelected = (
    selectObj: string | Selections,
    isSelected: boolean,
    clearChoices: boolean = false,
  ): void => {
    const oldSelected: Selections = clearChoices ? {} : R.clone(selected.value);

    // Add or remove object from selection based on isSelected
    // function for reuse
    const addOrRemove = (
      objId: string,
      addToSelected: boolean,
      count?: number,
    ) => {
      if (addToSelected) {
        return R.assoc(objId, count ?? 1);
      } else {
        return R.dissoc(objId);
      }
    };

    const addOrRemoveAll =
      (objIds: string[], addToSelected: boolean): Transform =>
      (sel: Selections) =>
        R.reduceRight(
          (id, acc) => addOrRemove(id, addToSelected)(acc),
          sel,
          objIds,
        );

    const addActivateOtherChoice = (
      obj: ProjectObj,
      addToSelected: boolean,
    ): Transform => {
      if (!obj.activateOtherChoice) {
        return R.identity;
      } else {
        const choices = R.split(',', obj.activateThisChoice);
        return addOrRemoveAll(choices, addToSelected);
      }
    };

    const addDeactivateOtherChoice = (
      obj: ProjectObj,
      addToSelected: boolean,
    ): Transform => {
      // Skip if the object is being de-selected
      if (!obj.deactivateOtherChoice || !addToSelected) {
        return R.identity;
      } else {
        const choices = R.split(',', obj.deactivateThisChoice);
        return addOrRemoveAll(choices, false);
      }
    };

    const clearIncompatibleChoices = (): Transform => (sel: Selections) => {
      let sel0 = R.clone(sel);
      let sel1 = R.clone(sel);

      // Required to handle transitive dependencies
      // TODO: Use graph traversal instead
      let changed = true;
      let depth = 0;
      while (changed && depth < 10) {
        sel1 = R.pickBy((_, objectId): boolean => {
          const object = getObject.value(objectId);
          const pred = buildConditions(object);
          return pred(R.keys(sel0));
        }, sel0);

        const diff = R.symmetricDifference(R.keys(sel1), R.keys(sel0));
        changed = R.isNotEmpty(diff);
        sel0 = R.clone(sel1);
        depth++;
      }

      return sel1;
    };

    const enforceRowLimits =
      (addedIds: string[]): Transform =>
      (sel: Selections) => {
        // Compute which rows had a modified limit based on the selected items
        const rowDeltas: Record<string, number> = R.pipe(
          R.toPairs,
          R.reduceRight(([objectId, count]: [string, number], acc) => {
            const obj: ProjectObj = getObject.value(objectId);
            if (obj.addToAllowChoice) {
              const path = [obj.idOfAllowChoice];
              const delta = R.pipe(
                R.pathOr(0, path),
                // Multiply the allowed choices by the number of times the choice is selected
                R.add(obj.numbAddToAllowChoice * count),
              )(acc);
              return R.assocPath(path, delta, acc);
            } else {
              return acc;
            }
          }, {}),
        )(sel);

        const removeObjIds: string[] = R.pipe(
          // Extract only the IDs since we don't care about the quantity
          R.keys,
          R.filter((key) => typeof key === 'string'),
          // Group by rowId
          R.groupBy((objId: string): string => getObjectRow.value(objId)),
          // Only check rows that had items added
          // (by comparing the intersection with the added set)
          R.pickBy((val: string[]) => {
            return !R.isEmpty(R.intersection(val, addedIds));
          }),
          // Check the limit for each row and return the set of IDs to remove
          R.mapObjIndexed(
            (selectedObjIds: string[] | undefined, rowId: string): string[] => {
              if (!selectedObjIds) return [];

              const row: ProjectRow = getRow.value(rowId);
              const selectedObjList: string[] = R.filter(
                (objId) => !getObject.value(objId)?.isSelectableMultiple,
                selectedObjIds,
              );

              // Get the delta (if any) and ensure that the value cannot go below 0
              const delta: number = R.propOr(0, row.id, rowDeltas);
              const allowedChoices = Math.max(row.allowedChoices + delta, 0);

              if (allowedChoices > 0) {
                // If the number of selected objects from the same row is equal to or greater than allowedChoices,
                // deselect the oldest objects
                const amountToRemove = selectedObjList.length - allowedChoices;
                if (amountToRemove > 0) {
                  // Exclude the newly added choices from the possible items to remove
                  const canRemoveIds = R.difference(selectedObjList, addedIds);
                  return R.slice(0, amountToRemove, canRemoveIds);
                }
              }
              return [];
            },
          ),
          R.values,
          R.flatten,
        )(sel);

        return addOrRemoveAll(removeObjIds, false)(sel);
      };

    // Compute the set of new selections
    let newSelected0: Selections;
    if (typeof selectObj === 'object') {
      // Add or remove all the provided objects
      const validSelections = R.filter(
        ([objId, _count]) => R.isNotNil(getObject.value(objId)),
        R.toPairs(selectObj),
      );
      const newSelected_ = R.reduce(
        (acc, [objId, count]) => {
          const obj = getObject.value(objId);
          return R.pipe(
            addOrRemove(objId, isSelected, count),
            addActivateOtherChoice(obj, isSelected),
            addDeactivateOtherChoice(obj, isSelected),
          )(acc);
        },
        oldSelected,
        validSelections,
      );
      // Apply incompatibility rules after the objects are selected
      newSelected0 = clearIncompatibleChoices()(newSelected_);
    } else {
      const obj = getObject.value(selectObj);
      newSelected0 = R.pipe(
        // Add or remove the objectId to the selection array
        addOrRemove(selectObj, isSelected),
        // Toggle the choices that depend on this object
        addActivateOtherChoice(obj, isSelected),
        // Disable the choices that depend on this object
        addDeactivateOtherChoice(obj, isSelected),
        // Remove incompatible objects
        clearIncompatibleChoices(),
      )(oldSelected);
    }

    // Compute which elements were added (if any)
    const addedIds = R.difference(R.keys(newSelected0), R.keys(oldSelected));
    const removedIds = R.filter(
      (objId) => objId !== objId,
      R.difference(R.keys(oldSelected), R.keys(newSelected0)),
    );
    let newSelected = newSelected0;
    if (addedIds.length > 0) {
      newSelected = enforceRowLimits(addedIds)(newSelected);
    }
    if (removedIds.length > 0) {
      const removedNames = R.map((objId: string): string => {
        const obj: ProjectObj = getObject.value(objId);
        return obj.title;
      }, removedIds);
      // $toast.info(`Removed selections: ${R.join(', ', removedNames)}`);
    }

    selected.value = newSelected;
    buildModified.value = true;
  };

  const incSelected = (id: string, incValue: number = 1) => {
    if (!R.has(id, selected.value)) {
      setSelected(id, true);
    } else {
      const obj = getObject.value(id);
      const maxValue = Number.parseInt(obj.numMultipleTimesPluss);

      const curValue = selected.value[id];
      selected.value[id] = Math.min(curValue + incValue, maxValue);
    }
  };

  const decSelected = (id: string, decValue: number = 1) => {
    if (R.has(id, selected.value)) {
      const obj = getObject.value(id);
      const minValue = Number.parseInt(obj.numMultipleTimesMinus);

      const curValue = selected.value[id];
      const nextValue = Math.max(curValue - decValue, minValue);
      if (nextValue <= 0) {
        setSelected(id, false);
      } else {
        selected.value[id] = nextValue;
      }
    }
  };

  return {
    store,
    project,
    isLocal,
    projectRows,
    backpack,
    pointTypes,
    selected,
    selectedIds,
    buildData,
    buildNotes,
    buildModified,
    isLoaded,
    loadProject,
    unloadProject,
    getRow,
    getObject,
    getObjectAddon,
    getObjectRow,
    getPointType,
    indexMap,
    setSelected,
    incSelected,
    decSelected,
  };
});

export const useProjectRefs = () => storeToRefs(useProjectStore());
