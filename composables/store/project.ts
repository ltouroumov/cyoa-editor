import { defineStore } from 'pinia';
import { Project, ProjectFile, ProjectObj, ProjectRow } from '~/composables/project';
import * as R from 'ramda';

export const useProjectStore = defineStore('project', () => {
  const project = ref<ProjectFile | null>(null);

  const getName = computed(() => {
    const names: Record<string, string> = R.fromPairs(
      R.chain(
        (row: ProjectRow) => {
          let objects: [string, string][] = R.map(
            (obj: ProjectObj): [string, string] => [obj.id, obj.title],
            row.objects
          );
          return R.append([row.id, row.title], objects);
        },
        project.value?.data.rows ?? []
      )
    )

    return (id: string) => names[id] ?? '???';
  })

  const isLoaded = computed(() => !!project.value);
  const loadProject = (data: Project, file: string) => {
    project.value = { data, file };
  }
  const unloadProject = () => {
    project.value = null;
  }


  return { project, isLoaded, loadProject, unloadProject, getName };
});