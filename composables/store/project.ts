import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';
import { ComputedRef, Ref, computed } from 'vue';

import { Condition, buildRootCondition } from '~/composables/conditions';
import {
  HasId,
  HasRequirements,
  PointType,
  Project,
  ProjectFile,
  ProjectObj,
  ProjectRow,
} from '~/composables/project';

type Deps = Record<string, string[]>;

export const useProjectStore = defineStore('project', () => {
  const project = ref<ProjectFile | null>(null);
  const selected = ref<string[]>([]);

  const backpack: ComputedRef<ProjectRow[]> = computed(
    () => project.value?.data.backpack ?? [],
  );

  const pointTypes: ComputedRef<PointType[]> = computed(
    () => project.value?.data.pointTypes ?? [],
  );

  const projectRows: ComputedRef<ProjectRow[]> = computed(
    () => project.value?.data.rows ?? [],
  );
  const projectObjs: ComputedRef<ProjectObj[]> = computed(() =>
    R.chain(R.prop('objects'), projectRows.value),
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

  function _buildConditions(seq: (HasId & HasRequirements)[]) {
    return R.pipe(
      R.filter(({ requireds }: HasRequirements) => !R.isEmpty(requireds)),
      R.map((item: HasRequirements & HasId): [string, Condition] => [
        item.id,
        buildRootCondition(item.requireds),
      ]),
      R.fromPairs,
    )(seq);
  }

  function _buildDeps(seq: Record<string, Condition>): Deps {
    return R.pipe(
      R.toPairs,
      R.chain(([id, { deps }]: [string, Condition]) =>
        R.map((dep: string): [string, string] => [dep, id], deps),
      ),
      R.reduceBy(
        (acc: string[], [_, dep]) => R.append(dep, acc),
        [],
        ([dep, _]) => dep,
      ),
    )(seq);
  }

  const rowConditions = computed(() => {
    console.log('rebuild rowConditions');
    return _buildConditions(projectRows.value);
  });
  const rowDeps: ComputedRef<Deps> = computed(() => {
    console.log('rebuild rowDeps');
    return _buildDeps(rowConditions.value);
  });
  const rowStatus: Ref<Record<string, boolean>> = ref({});

  // const objConditions = computed(() => _buildConditions(projectObjs.value));
  // const objDeps = computed(() => _buildDeps(objConditions.value));

  watch(projectRows, (newRows) => {
    console.log('rebuild rowStatus defaults');

    const _selected: string[] = selected.value;

    rowStatus.value = R.pipe(
      R.map((row: ProjectRow): [string, boolean] => {
        if (row.id in rowConditions.value) {
          const { exec } = rowConditions.value[row.id];
          return [row.id, exec(_selected)];
        } else {
          return [row.id, true];
        }
      }),
      R.fromPairs,
    )(newRows);
  });

  watch(selected, (newValue, oldValue) => {
    const _deps = rowDeps.value;
    const _cond = rowConditions.value;
    const updated = R.symmetricDifference(newValue, oldValue);

    const _status: Record<string, boolean> = {};
    R.pipe(
      R.chain((id: string) => _deps[id] ?? []),
      R.forEach((dep: string) => {
        const { exec } = _cond[dep];
        _status[dep] = exec(newValue);
      }),
    )(updated);

    rowStatus.value = { ...rowStatus.value, ..._status };
  });

  const setSelected = (id: string, isSelected: boolean) => {
    if (isSelected) {
      selected.value = R.append(id, selected.value);
    } else {
      selected.value = R.without([id], selected.value);
    }
  };

  const setRowStatus = (id: string, status: boolean) => {
    rowStatus.value = { ...rowStatus.value, [id]: status };
  };

  return {
    project,
    projectRows,
    projectObjs,
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
    rowConditions,
    rowDeps,
    rowStatus,
    setRowStatus,
  };
});

export const useProjectRefs = () => storeToRefs(useProjectStore());
