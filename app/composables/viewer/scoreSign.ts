import type { PointType } from '~/composables/project/types/v1';

/**
 * Render a per-choice score value the way the legacy viewer's `ObjectScore.vue`
 * does: always the magnitude, optionally prefixed with an explicit sign.
 *
 * When `plussOrMinusAdded` is set on the point type a `+` / `-` is prepended.
 * The legacy default (not inverted) is arithmetically backwards on purpose: a
 * negative value shows `+`, a positive value shows `-`. `plussOrMinusInverted`
 * flips that back to the intuitive mapping.
 */
export const applyScoreSign = (
  value: number,
  pointType:
    | Pick<PointType, 'plussOrMinusAdded' | 'plussOrMinusInverted'>
    | undefined,
): string => {
  const magnitude = String(Math.abs(value));
  if (!pointType?.plussOrMinusAdded) return magnitude;

  const showPlus = value < 0 !== Boolean(pointType.plussOrMinusInverted);
  return (showPlus ? '+' : '-') + magnitude;
};
