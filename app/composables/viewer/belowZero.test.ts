import { describe, expect, it } from 'vitest';

import { violatesBelowZero } from './belowZero';

import type { PointType } from '~/composables/project/types/v1';

const pt = (id: string, belowZeroNotAllowed?: boolean): PointType =>
  ({ id, belowZeroNotAllowed }) as PointType;

describe('violatesBelowZero', () => {
  it('blocks a flagged point type that goes negative', () => {
    expect(violatesBelowZero([pt('p', true)], { p: -1 })).toBe(true);
  });

  it('allows a flagged point type sitting at exactly zero', () => {
    expect(violatesBelowZero([pt('p', true)], { p: 0 })).toBe(false);
  });

  it('ignores an unflagged point type that goes negative', () => {
    expect(violatesBelowZero([pt('p')], { p: -5 })).toBe(false);
  });

  it('returns false when no point type is flagged', () => {
    expect(violatesBelowZero([pt('a'), pt('b')], { a: -3, b: -9 })).toBe(false);
  });

  it('checks every flagged point type, not just the first', () => {
    const types = [pt('a', true), pt('b', true)];
    expect(violatesBelowZero(types, { a: 4, b: -2 })).toBe(true);
  });

  it('treats a missing total as zero', () => {
    expect(violatesBelowZero([pt('p', true)], {})).toBe(false);
  });
});
