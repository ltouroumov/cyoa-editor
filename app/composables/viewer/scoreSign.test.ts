import { describe, expect, it } from 'vitest';

import { applyScoreSign } from './scoreSign';

import type { PointType } from '~/composables/project/types/v1';

const pt = (added?: boolean, inverted?: boolean): PointType =>
  ({
    id: 'p',
    plussOrMinusAdded: added,
    plussOrMinusInverted: inverted,
  }) as PointType;

describe('applyScoreSign', () => {
  it('shows the bare magnitude when the point type is undefined', () => {
    expect(applyScoreSign(-5, undefined)).toBe('5');
  });

  it('shows the bare magnitude when plussOrMinusAdded is off', () => {
    expect(applyScoreSign(-5, pt(false))).toBe('5');
    expect(applyScoreSign(5, pt(false))).toBe('5');
  });

  it('prefixes a negative value with + when added and not inverted (legacy default)', () => {
    expect(applyScoreSign(-5, pt(true))).toBe('+5');
  });

  it('prefixes a positive value with - when added and not inverted (legacy default)', () => {
    expect(applyScoreSign(5, pt(true))).toBe('-5');
  });

  it('flips the sign when plussOrMinusInverted is on', () => {
    expect(applyScoreSign(-5, pt(true, true))).toBe('-5');
    expect(applyScoreSign(5, pt(true, true))).toBe('+5');
  });

  it('treats zero as non-negative (legacy quirk: renders -0 when not inverted)', () => {
    expect(applyScoreSign(0, pt(true))).toBe('-0');
    expect(applyScoreSign(0, pt(true, true))).toBe('+0');
  });
});
