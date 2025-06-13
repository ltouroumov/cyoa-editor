import * as R from 'ramda';
import { computed } from 'vue';

import { buildConditions } from '~/composables/conditions';
import type {
  PointType,
  ProjectObj,
  Score,
} from '~/composables/project/types/v1';
import { type Selections, useProjectStore } from '~/composables/store/project';

export type ScoreAcc = { cost: number; gain: number };
type ScoreRes = { id: string } & ScoreAcc;

export function usePoints() {
  const store = useProjectStore();

  const computePointsForSelection = (
    selected: Selections,
    globalSelected?: Selections,
  ): Record<string, ScoreAcc> => {
    const _globalSelectedIds = R.keys(globalSelected ?? selected);
    const _selectedIds = R.keys(selected);

    return R.pipe(
      R.map((id: string): { obj: ProjectObj; count: number } => ({
        obj: store.getObject(id),
        count: selected[id],
      })),

      R.chain(({ obj, count }) => {
        return R.pipe(
          R.filter((score: Score) => {
            const pointType = store.getPointType(score.id);
            const cond = buildConditions(score);
            return (
              cond(_globalSelectedIds) &&
              (R.isEmpty(pointType.activatedId) ||
                R.includes(pointType.activatedId, _globalSelectedIds))
            );
          }),
          R.map(({ id, value }: Score): ScoreRes => {
            const valueInt = Number.parseInt(value);
            return {
              id,
              cost: valueInt > 0 ? valueInt * count : 0,
              gain: valueInt < 0 ? -(valueInt * count) : 0,
            };
          }),
        )(obj.scores);
      }),
      R.reduceBy(
        (acc: ScoreAcc, cur: ScoreAcc): ScoreAcc => ({
          cost: acc.cost + cur.cost,
          gain: acc.gain + cur.gain,
        }),
        { cost: 0, gain: 0 },
        ({ id }: ScoreRes) => id,
      ),
    )(_selectedIds);
  };

  const mergeScoreAcc = (
    scores: Record<string, ScoreAcc>,
  ): Record<string, number> =>
    R.map((acc: ScoreAcc) => acc.gain - acc.cost, scores);

  const points = computed<Record<string, number>>(() => {
    const _selected = R.clone(store.selected);

    const startingSums: Record<string, number> = R.pipe(
      R.map(({ id, startingSum }: PointType): [string, number] => [
        id,
        startingSum,
      ]),
      R.fromPairs,
    )(store.pointTypes);

    return R.pipe(
      computePointsForSelection,
      mergeScoreAcc,
      R.mergeWith(R.add, startingSums),
    )(_selected);
  });

  return { points, computePointsForSelection };
}
