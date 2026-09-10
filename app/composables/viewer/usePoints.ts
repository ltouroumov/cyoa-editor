import * as R from 'ramda';
import { computed } from 'vue';

import { buildConditions } from '~/composables/conditions';
import type {
  PointType,
  ProjectObj,
  Score,
} from '~/composables/project/types/v1';
import { type Selections, useProjectStore } from '~/composables/store/project';
import {
  collectPointMutators,
  resolvePointTotals,
} from '~/composables/viewer/pointMutators';

export type ScoreAcc = { cost: number; gain: number };
type ScoreRes = { id: string } & ScoreAcc;

export function usePoints() {
  const store = useProjectStore();

  const startingSums = (): Record<string, number> =>
    R.pipe(
      R.map(({ id, startingSum }: PointType): [string, number] => [
        id,
        startingSum,
      ]),
      R.fromPairs,
    )(store.pointTypes);

  const computePointsForSelection = (
    selected: Selections,
    globalSelected?: Selections,
  ): Record<string, ScoreAcc> => {
    const _globalSelectedIds = R.keys(globalSelected ?? selected);
    const _selectedIds = R.keys(selected);

    // A `type: points` condition on a score is evaluated against the base
    // (pre-delta) sums: the running totals aren't known while they are still
    // being computed here. This mirrors the legacy viewer's order-dependent
    // behaviour closely enough for a rare edge case.
    const _startingSums = startingSums();

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
              cond(_globalSelectedIds, _startingSums) &&
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

  // Point totals a given selection would produce:
  //   round( (startingSum + gain) · Π multipliers / Π dividers − cost )
  // Additive score deltas fold in first; the legacy `multiplyPointtypeIsOn` /
  // `dividePointtypeIsOn` choice functions then scale the point gain before the
  // costs are subtracted. Point types with no multiplier/divider keep their
  // exact `startingSum + gain − cost` value (no rounding).
  const pointsForSelection = (selected: Selections): Record<string, number> => {
    const sums = startingSums();
    const acc = computePointsForSelection(selected);
    const mutators = collectPointMutators(R.keys(selected), store.getObject);
    return resolvePointTotals({
      pointTypeIds: R.union(R.keys(sums), R.keys(acc)),
      startingSum: (id) => sums[id] ?? 0,
      gain: (id) => acc[id]?.gain ?? 0,
      cost: (id) => acc[id]?.cost ?? 0,
      mutators,
    });
  };

  const points = computed<Record<string, number>>(() =>
    pointsForSelection(R.clone(store.selected)),
  );

  return { points, pointsForSelection, computePointsForSelection };
}
