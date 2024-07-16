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

  const getRow = computed(() => {
    const rows: Record<string, ProjectRow> = R.fromPairs(
      R.map(
        (row: ProjectRow): [string, ProjectRow] => [row.id, row],
        project.value?.data.rows ?? [],
      ),
    );

    return (id: string) => rows[id];
  });

  const getObject = computed(() => {
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

  const getObjectRow = computed(() => {
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
  };

  const setSelected = (id: string, isSelected: boolean) => {
    let selectedN = R.clone(selected.value);
    // Add or remove object from selection based on isSelected
    // function for reuse
    const addOrRemove = (objId: string, AddToSelected: boolean, num = 1) => {
      if (AddToSelected) {
        return R.assoc(objId, num, selectedN);
      } else {
        return R.dissoc(objId, selectedN);
      }
    };
    // Associate or Dessociate an object from the selected record
    selectedN = addOrRemove(id, isSelected);

    const obj = getObject.value(id);
    // If activateOtherChoice is true, select/unselect all objects in activateThisChoice
    if (obj.activateOtherChoice) {
      R.split(',', obj.activateThisChoice).forEach((objectId) => {
        selectedN = addOrRemove(objectId, isSelected);
      });
    }

    // Only check for incompatible objects if an object is selected
    if (isSelected) {
      // Remove any objects that are incompatible with the selected object
      selectedN = R.pickBy((_, objectId): boolean => {
        const object = getObject.value(objectId);
        const pred = buildConditions(object);
        return pred(R.keys(selectedN));
      }, selectedN);
    }

    // If allowedChoices is > 0, then there is a limit on the number of objects selected from the same row
    // If allowedChoices is 0, then there is no limit
    const rowId = getObjectRow.value(id);
    const row = getRow.value(rowId);
    if (row.allowedChoices > 0 && !obj.isSelectableMultiple) {
      // Of the selected objects, make a set of all objects selected from the same row
      const selectedRowObjects = R.intersection(
        R.keys(selected.value),
        R.map(R.prop('id'), row.objects),
      );
      // If the number of selected objects from the same row is equal to or greater than allowedChoices, deselect the oldest Object
      // Otherwise, select/unselect as needed
      if (selectedRowObjects.length >= row.allowedChoices) {
        const toDeselect = selectedRowObjects[0];
        selectedN = addOrRemove(toDeselect, false);
      }
    }

    selected.value = selectedN;
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
      R.map((id): { obj: ProjectObj; count: number } => ({
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
