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

  const rows: Ref<ProjectRow[]> = computed(
    () => project.value?.data.rows ?? [],
  );
  const scores: Ref<PointType[]> = computed(
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

  return {
    project,
    rows,
    scores,
    isLoaded,
    loadProject,
    unloadProject,
    getObject,
  };
});

export const useProjectRefs = () => storeToRefs(useProjectStore());
