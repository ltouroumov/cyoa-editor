import type { ProjectObj } from '~/composables/project/types/v1';

/**
 * A single multiply operation a selected choice applies to a point type: either
 * a plain constant, or a reference to another point type whose resolved total is
 * used as the factor (`multiplyPointtypeIsId`).
 */
export type MultiplyFactor =
  | { kind: 'const'; value: number }
  | { kind: 'ref'; pointTypeId: string };

export type PointMutators = {
  multipliers: MultiplyFactor[];
  dividers: number[];
};

const toNumber = (value: number | string | undefined): number =>
  typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));

/**
 * Legacy `multiplyPointtypeIsOn` / `dividePointtypeIsOn` choice functions:
 * selecting a flagged choice multiplies or divides a named point type.
 *
 * Gathers, per point type id, the operations contributed by the currently
 * selected choices:
 *
 * - `multiplyPointtypeIsOn` + `pointTypeToMultiply` + `multiplyWithThis`
 *   (a constant, or another point-type id when `multiplyPointtypeIsId`).
 * - `dividePointtypeIsOn` + `pointTypeToDivide` + `divideWithThis` (constant only,
 *   matching legacy).
 *
 * Invalid constants (`NaN`) and invalid divisors (`0`, `NaN`) are dropped; a
 * deliberate `0` constant multiplier is kept — it wipes the point gain.
 */
export const collectPointMutators = (
  selectedIds: string[],
  getObject: (id: string) => ProjectObj | undefined,
): Record<string, PointMutators> => {
  const result: Record<string, PointMutators> = {};

  const bucket = (pointTypeId: string): PointMutators => {
    if (!result[pointTypeId]) {
      result[pointTypeId] = { multipliers: [], dividers: [] };
    }
    return result[pointTypeId];
  };

  for (const id of selectedIds) {
    const obj = getObject(id);
    if (!obj) continue;

    if (obj.multiplyPointtypeIsOn && obj.pointTypeToMultiply) {
      if (obj.multiplyPointtypeIsId) {
        const ref = String(obj.multiplyWithThis ?? '');
        if (ref) {
          bucket(obj.pointTypeToMultiply).multipliers.push({
            kind: 'ref',
            pointTypeId: ref,
          });
        }
      } else {
        const value = toNumber(obj.multiplyWithThis);
        if (Number.isFinite(value)) {
          bucket(obj.pointTypeToMultiply).multipliers.push({
            kind: 'const',
            value,
          });
        }
      }
    }

    if (obj.dividePointtypeIsOn && obj.pointTypeToDivide) {
      const value = toNumber(obj.divideWithThis);
      if (Number.isFinite(value) && value !== 0) {
        bucket(obj.pointTypeToDivide).dividers.push(value);
      }
    }
  }

  return result;
};

export type ResolvePointTotalsInput = {
  pointTypeIds: string[];
  startingSum: (id: string) => number;
  gain: (id: string) => number;
  cost: (id: string) => number;
  mutators: Record<string, PointMutators>;
};

/**
 * Resolve every point type's running total:
 *
 *   round( (startingSum + gain) · Π multipliers / Π dividers − cost )
 *
 * Multipliers scale the point *gain* (drawbacks) before costs (perks) are
 * subtracted. Rounding is applied only to point types that carry at least one
 * multiplier or divider; the rest are returned exactly as
 * `startingSum + gain − cost`.
 *
 * Id-based multipliers make point totals depend on one another. They are
 * resolved by DFS with memoisation, which visits each point type only after its
 * dependencies (an implicit topological order). A reference that points back
 * into a total still being computed is a cycle: that one factor falls back to
 * the referenced point type's raw starting sum.
 */
export const resolvePointTotals = (
  input: ResolvePointTotalsInput,
): Record<string, number> => {
  const { pointTypeIds, startingSum, gain, cost, mutators } = input;

  const resolved: Record<string, number> = {};
  const inProgress = new Set<string>();

  const totalOf = (id: string): number => {
    if (id in resolved) return resolved[id];
    inProgress.add(id);

    const base = startingSum(id) + gain(id);
    const mut = mutators[id];

    let value: number;
    if (!mut || (mut.multipliers.length === 0 && mut.dividers.length === 0)) {
      value = base - cost(id);
    } else {
      const mulProduct = mut.multipliers.reduce((acc, factor) => {
        if (factor.kind === 'const') return acc * factor.value;
        // A reference back into a total still being computed is a cycle: fall
        // back to the referenced point type's starting sum for this factor.
        const f = inProgress.has(factor.pointTypeId)
          ? startingSum(factor.pointTypeId)
          : totalOf(factor.pointTypeId);
        return acc * f;
      }, 1);
      const divProduct = mut.dividers.reduce((acc, d) => acc * d, 1);
      value = Math.round((base * mulProduct) / divProduct - cost(id));
    }

    inProgress.delete(id);
    resolved[id] = value;
    return value;
  };

  for (const id of pointTypeIds) totalOf(id);
  return resolved;
};
