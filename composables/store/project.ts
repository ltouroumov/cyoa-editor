import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';
import { ComputedRef, computed } from 'vue';

import { buildConditions } from '~/composables/conditions';
import {
  PointType,
  Project,
  ProjectFile,
  ProjectObj,
  ProjectRow,
  Score,
} from '~/composables/project';

export type Selections = Record<string, number>;
type Transform = (sel: Selections) => Selections;

export const useProjectStore = defineStore('project', () => {
  const project = shallowRef<ProjectFile | null>(null);
  const selected = ref<Selections>({});
  const selectedIds = computed(() => R.keys(selected.value));

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
    const rows: Record<string, ProjectRow> = R.fromPairs(
      R.map(
        (row: ProjectRow): [string, ProjectRow] => [row.id, row],
        project.value?.data.rows ?? [],
      ),
    );

    return (id: string) => rows[id];
  });

  const getObject: ComputedRef<(id: string) => ProjectObj> = computed(() => {
    const objects: Record<string, ProjectObj> = R.fromPairs(
      R.chain(
        (row: ProjectRow) =>
          R.map(
            (obj: ProjectObj): [string, ProjectObj] => [obj.id, obj],
            row.objects,
          ),
        project.value?.data.rows ?? [],
      ),
    );

    return (id: string) => objects[id];
  });

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

  const isLoaded = computed(() => !!project.value);
  const loadProject = (data: Project, file: string) => {
    project.value = { data, file };
  };
  const unloadProject = () => {
    project.value = null;
    selected.value = {};
  };

  const setSelected = (id: string, isSelected: boolean): void => {
    const oldSelected: Selections = R.clone(selected.value);
    const obj = getObject.value(id);

    // Add or remove object from selection based on isSelected
    // function for reuse
    const addOrRemove = (objId: string, addToSelected: boolean) => {
      if (addToSelected) {
        return R.assoc(objId, 1);
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

    const clearIncompatibleChoices = (): Transform => (sel: Selections) =>
      R.pickBy((_, objectId): boolean => {
        const object = getObject.value(objectId);
        const pred = buildConditions(object);
        return pred(R.keys(sel));
      }, sel);

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
    const newSelected: Selections = R.pipe(
      // Add or remove the objectId to the selection array
      addOrRemove(id, isSelected),
      // Toggle the choices that depend on this object
      addActivateOtherChoice(obj, isSelected),
      // Disable the choices that depend on this object
      addDeactivateOtherChoice(obj, isSelected),
      // Remove incompatible objects
      clearIncompatibleChoices(),
    )(oldSelected);

    // Compute which elements were added (if any)
    const addedIds = R.difference(R.keys(newSelected), R.keys(oldSelected));
    if (addedIds.length > 0) {
      selected.value = enforceRowLimits(addedIds)(newSelected);
    } else {
      selected.value = newSelected;
    }
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

  const points = computed<Record<string, number>>(() => {
    const _selected = R.clone(selected.value);
    const _selectedIds = R.clone(selectedIds.value);

    const startingSums: Record<string, number> = R.pipe(
      R.map(({ id, startingSum }: PointType): [string, number] => [
        id,
        startingSum,
      ]),
      R.fromPairs,
    )(pointTypes.value);

    return R.pipe(
      R.keys,
      R.filter((key) => typeof key === 'string'),
      R.map((id: string): { obj: ProjectObj; count: number } => ({
        obj: getObject.value(id),
        count: _selected[id],
      })),

      R.chain(({ obj, count }) => {
        return R.pipe(
          R.filter((score: Score) => {
            const cond = buildConditions(score);
            return cond(_selectedIds);
          }),
          R.map(({ id, value }: Score): { id: string; value: number } => {
            return {
              id,
              value: Number.parseInt(value) * count,
            };
          }),
        )(obj.scores);
      }),
      R.reduceBy(
        (acc, { value }) => acc + value,
        0,
        ({ id }) => id,
      ),
      R.mergeWith(R.add, startingSums),
    )(_selected);
  });

  return {
    project,
    projectRows,
    backpack,
    pointTypes,
    selected,
    selectedIds,
    points,
    isLoaded,
    loadProject,
    unloadProject,
    getRow,
    getObject,
    getObjectRow,
    setSelected,
    incSelected,
    decSelected,
  };
});

export const useProjectRefs = () => storeToRefs(useProjectStore());
