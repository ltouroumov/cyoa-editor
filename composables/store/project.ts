import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';
import { ComputedRef, computed } from 'vue';

import {
  PointType,
  Project,
  ProjectFile,
  ProjectObj,
  ProjectRow,
} from '~/composables/project';

export const useProjectStore = defineStore('project', () => {
  const project = ref<ProjectFile | null>(null);
  const selected = ref<string[]>([]);

  const backpack: ComputedRef<ProjectRow[]> = computed(
    () => project.value?.data.backpack ?? [],
  );

  const pointTypes: ComputedRef<PointType[]> = computed(
    () => project.value?.data.pointTypes ?? [],
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

  const conditions = computed(() =>
    R.pipe(
      R.chain((row: ProjectRow) =>
        R.map((obj: ProjectObj) => [row, obj], row.objects),
      ),
    )(project.value?.data.rows ?? []),
  );

  const setSelected = (id: string, isSelected: boolean) => {
    console.log(`setSelected(${id}, ${isSelected})`);
    if (isSelected) {
      selected.value = R.append(id, selected.value);
    } else {
      selected.value = R.without([id], selected.value);
    }
  };

  return {
    project,
    backpack,
    selected,
    pointTypes,
    isLoaded,
    loadProject,
    unloadProject,
    getRow,
    getObject,
    getObjectRow,
    setSelected,
    conditions,
  };
});

export const useProjectRefs = () => storeToRefs(useProjectStore());
