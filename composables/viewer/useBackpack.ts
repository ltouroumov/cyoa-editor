import * as R from 'ramda';
import { computed } from 'vue';

import type { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

export type PackRowChoice = { row: ProjectRow; obj: ProjectObj; count: number };
export type PackRow = { packRow: ProjectRow; choices: PackRowChoice[] };
export function useBackpack() {
  const { getObject, getObjectRow, getRow } = useProjectStore();
  const { selected, backpack } = useProjectRefs();

  const packRows = computed(() => {
    const selectedChoices = R.map(
      ([id, count]): PackRowChoice => ({
        obj: getObject(id),
        row: getRow(getObjectRow(id)),
        count,
      }),
      R.toPairs(selected.value),
    );
    const choicesByGroup: Partial<Record<string, PackRowChoice[]>> = R.groupBy(
      ({ obj, row }) => R.head(obj.groups)?.id ?? row.resultGroupId,
      selectedChoices,
    );

    return R.chain(
      (row: ProjectRow): PackRow[] =>
        row.resultGroupId in choicesByGroup
          ? [{ packRow: row, choices: choicesByGroup[row.resultGroupId] ?? [] }]
          : [],
      backpack.value,
    );
  });

  return { packRows };
}
