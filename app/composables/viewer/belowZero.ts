import * as R from 'ramda';

import type { PointType } from '~/composables/project/types/v1';

/**
 * Legacy `checkPoints` parity: a selection is blocked when it would drive a
 * point type flagged `belowZeroNotAllowed` below zero.
 *
 * @param pointTypes the project's point types
 * @param totals     the point totals the selection would produce, keyed by id
 * @returns true when any flagged point type ends up negative
 */
export const violatesBelowZero = (
  pointTypes: PointType[],
  totals: Record<string, number>,
): boolean =>
  R.any(
    (pt: PointType) =>
      pt.belowZeroNotAllowed === true && (totals[pt.id] ?? 0) < 0,
    pointTypes,
  );
