import {
  assoc,
  chain,
  clone,
  filter,
  groupBy,
  head,
  map,
  prop,
  reduce,
  sortWith,
  toPairs,
} from 'ramda';
import { computed } from 'vue';

import type {
  ObjAddon,
  ProjectObj,
  ProjectRow,
} from '~/composables/project/types/v1';
import {
  type IndexMapT,
  type Selections,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';
import { type ScoreAcc, usePoints } from '~/composables/viewer/usePoints';

export type PackRowChoice = {
  row: ProjectRow;
  obj: ProjectObj;
  addons: ObjAddon[];
  count: number;
};
export type PackRow = {
  packRow: ProjectRow;
  choices: PackRowChoice[];
  scores: Record<string, ScoreAcc>;
};

export function useBackpack() {
  const { getObject, getObjectRow, getRow } = useProjectStore();
  const { selected, selectedIds, backpack, indexMap } = useProjectRefs();
  const { computePointsForSelection } = usePoints();

  const packRows = computed(() => {
    const _indexMap: IndexMapT = indexMap.value;
    const _selected = clone(selected.value);

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

    const selectedChoices = map(([id, count]): PackRowChoice => {
      const obj = getObject(id);

      const activeAddons = filter((addon) => {
        const condition = buildConditions(addon);
        return condition(selectedIds.value);
      }, obj.addons);

      return {
        obj: obj,
        row: getRow(getObjectRow(id)),
        addons: activeAddons,
        count,
      };
    }, toPairs(_selected));

    const choicesByGroup: Partial<Record<string, PackRowChoice[]>> = groupBy(
      ({ obj, row }) => head(obj.groups)?.id ?? row.resultGroupId,
      selectedChoices,
    );

    return chain((row: ProjectRow): PackRow[] => {
      if (row.resultGroupId in choicesByGroup) {
        const choicesInGroup = choicesByGroup[row.resultGroupId] ?? [];
        const selectedInGroup: Selections = reduce(
          (acc: Selections, prc: PackRowChoice): Selections => {
            const key = prc.obj.id;
            return assoc(key, prop(key, _selected), acc);
          },
          {},
          choicesInGroup,
        );
        const groupScores = computePointsForSelection(
          selectedInGroup,
          _selected,
        );
        console.log(
          `score for ${row.title} (${row.id})`,
          selectedInGroup,
          groupScores,
        );
        const entry: PackRow = {
          packRow: row,
          choices: sortWith([cmpRowIndex, cmpObjIndex], choicesInGroup),
          scores: groupScores,
        };
        return [entry];
      } else {
        return [];
      }
    }, backpack.value);
  });

  return { packRows };
}
