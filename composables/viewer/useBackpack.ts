import * as R from 'ramda';
import { sortWith } from 'ramda';
import { computed } from 'vue';

import type { ProjectObj, ProjectRow } from '~/composables/project';
import {
  type IndexMapT,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';

export type PackRowChoice = {
  row: ProjectRow;
  obj: ProjectObj;
  addons: ObjAddon[];
  count: number;
};
export type PackRow = { packRow: ProjectRow; choices: PackRowChoice[] };
export function useBackpack() {
  const { getObject, getObjectRow, getRow } = useProjectStore();
  const { selected, selectedIds, backpack, indexMap } = useProjectRefs();

  const packRows = computed(() => {
    const _indexMap: IndexMapT = indexMap.value;

    const cmp = (a: number, b: number): number => {
      return a === b ? 0 : a > b ? 1 : -1;
    };
    const cmpRowIndex = (itemA: PackRowChoice, itemB: PackRowChoice) => {
      const idxA = _indexMap[itemA.row.id].index;
      const idxB = _indexMap[itemB.row.id].index;
      return cmp(idxA, idxB);
    };
    const cmpObjIndex = (itemA: PackRowChoice, itemB: PackRowChoice) => {
      const idxA = _indexMap[itemA.row.id].objects[itemA.obj.id];
      const idxB = _indexMap[itemB.row.id].objects[itemB.obj.id];
      return cmp(idxA, idxB);
    };

    const selectedChoices = R.map(([id, count]): PackRowChoice => {
      const obj = getObject(id);

      const activeAddons = R.filter((addon) => {
        const condition = buildConditions(addon);
        return condition(selectedIds.value);
      }, obj.addons);

      return {
        obj: obj,
        row: getRow(getObjectRow(id)),
        addons: activeAddons,
        count,
      };
    }, R.toPairs(selected.value));
    const choicesByGroup: Partial<Record<string, PackRowChoice[]>> = R.groupBy(
      ({ obj, row }) => R.head(obj.groups)?.id ?? row.resultGroupId,
      selectedChoices,
    );

    return R.chain((row: ProjectRow): PackRow[] => {
      if (row.resultGroupId in choicesByGroup) {
        const entry = {
          packRow: row,
          choices: sortWith(
            [cmpRowIndex, cmpObjIndex],
            choicesByGroup[row.resultGroupId] ?? [],
          ),
        };
        return [entry];
      } else {
        return [];
      }
    }, backpack.value);
  });

  return { packRows };
}
