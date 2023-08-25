import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';
import { Ref, computed } from 'vue';

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

  const pointTypes: Ref<PointType[]> = computed(
    () => project.value?.data.pointTypes ?? [],
  );

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

  const isLoaded = computed(() => !!project.value);
  const loadProject = (data: Project, file: string) => {
    project.value = { data, file };
  };
  const unloadProject = () => {
    project.value = null;
  };

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
    selected,
    pointTypes,
    isLoaded,
    loadProject,
    unloadProject,
    getObject,
    setSelected,
  };
});

export const useProjectRefs = () => storeToRefs(useProjectStore());
