import { describe, expect, it } from 'vitest';

import {
  type PointMutators,
  collectPointMutators,
  resolvePointTotals,
} from './pointMutators';

import type { ProjectObj } from '~/composables/project/types/v1';

const obj = (id: string, props: Partial<ProjectObj>): ProjectObj =>
  ({ id, ...props }) as ProjectObj;

const lookup =
  (objects: ProjectObj[]) =>
  (id: string): ProjectObj | undefined =>
    objects.find((o) => o.id === id);

describe('collectPointMutators', () => {
  it('collects a constant multiplier for the named point type', () => {
    const objects = [
      obj('a', {
        multiplyPointtypeIsOn: true,
        pointTypeToMultiply: 'p',
        multiplyWithThis: 2,
      }),
    ];
    const result = collectPointMutators(['a'], lookup(objects));
    expect(result.p).toEqual({
      multipliers: [{ kind: 'const', value: 2 }],
      dividers: [],
    });
  });

  it('parses a string constant multiplier', () => {
    const objects = [
      obj('a', {
        multiplyPointtypeIsOn: true,
        pointTypeToMultiply: 'p',
        multiplyWithThis: '1.5',
      }),
    ];
    expect(collectPointMutators(['a'], lookup(objects)).p.multipliers).toEqual([
      { kind: 'const', value: 1.5 },
    ]);
  });

  it('keeps a deliberate zero constant multiplier', () => {
    const objects = [
      obj('a', {
        multiplyPointtypeIsOn: true,
        pointTypeToMultiply: 'p',
        multiplyWithThis: 0,
      }),
    ];
    expect(collectPointMutators(['a'], lookup(objects)).p.multipliers).toEqual([
      { kind: 'const', value: 0 },
    ]);
  });

  it('drops a NaN constant multiplier', () => {
    const objects = [
      obj('a', {
        multiplyPointtypeIsOn: true,
        pointTypeToMultiply: 'p',
        multiplyWithThis: 'not-a-number',
      }),
    ];
    expect(collectPointMutators(['a'], lookup(objects))).toEqual({});
  });

  it('collects an id-based multiplier as a ref factor', () => {
    const objects = [
      obj('a', {
        multiplyPointtypeIsOn: true,
        multiplyPointtypeIsId: true,
        pointTypeToMultiply: 'p',
        multiplyWithThis: 'q',
      }),
    ];
    expect(collectPointMutators(['a'], lookup(objects)).p.multipliers).toEqual([
      { kind: 'ref', pointTypeId: 'q' },
    ]);
  });

  it('collects a divider and drops a zero divisor', () => {
    const objects = [
      obj('a', {
        dividePointtypeIsOn: true,
        pointTypeToDivide: 'p',
        divideWithThis: 4,
      }),
      obj('b', {
        dividePointtypeIsOn: true,
        pointTypeToDivide: 'p',
        divideWithThis: 0,
      }),
    ];
    expect(
      collectPointMutators(['a', 'b'], lookup(objects)).p.dividers,
    ).toEqual([4]);
  });

  it('compounds multipliers from several selected choices', () => {
    const objects = [
      obj('a', {
        multiplyPointtypeIsOn: true,
        pointTypeToMultiply: 'p',
        multiplyWithThis: 2,
      }),
      obj('b', {
        multiplyPointtypeIsOn: true,
        multiplyPointtypeIsId: true,
        pointTypeToMultiply: 'p',
        multiplyWithThis: 'q',
      }),
    ];
    expect(
      collectPointMutators(['a', 'b'], lookup(objects)).p.multipliers,
    ).toEqual([
      { kind: 'const', value: 2 },
      { kind: 'ref', pointTypeId: 'q' },
    ]);
  });

  it('ignores unknown ids and choices without the flag', () => {
    const objects = [obj('a', { multiplyPointtypeIsOn: false })];
    expect(collectPointMutators(['a', 'missing'], lookup(objects))).toEqual({});
  });
});

describe('resolvePointTotals', () => {
  const resolve = (opts: {
    pointTypeIds: string[];
    startingSums: Record<string, number>;
    gains?: Record<string, number>;
    costs?: Record<string, number>;
    mutators?: Record<string, PointMutators>;
  }) => {
    const { startingSums, gains = {}, costs = {}, mutators = {} } = opts;
    return resolvePointTotals({
      pointTypeIds: opts.pointTypeIds,
      startingSum: (id: string) => startingSums[id] ?? 0,
      gain: (id: string) => gains[id] ?? 0,
      cost: (id: string) => costs[id] ?? 0,
      mutators,
    });
  };

  it('returns startingSum + gain - cost untouched when no mutators apply', () => {
    const totals = resolve({
      pointTypeIds: ['p'],
      startingSums: { p: 10 },
      gains: { p: 5 },
      costs: { p: 3 },
    });
    expect(totals.p).toBe(12);
  });

  it('does not round an unmutated fractional total', () => {
    const totals = resolve({
      pointTypeIds: ['p'],
      startingSums: { p: 0.5 },
    });
    expect(totals.p).toBe(0.5);
  });

  it('multiplies (startingSum + gain) before subtracting cost, then rounds', () => {
    // (10 + 5) * 2 - 3 = 27
    const totals = resolve({
      pointTypeIds: ['p'],
      startingSums: { p: 10 },
      gains: { p: 5 },
      costs: { p: 3 },
      mutators: {
        p: { multipliers: [{ kind: 'const', value: 2 }], dividers: [] },
      },
    });
    expect(totals.p).toBe(27);
  });

  it('divides and rounds to the nearest integer', () => {
    // (10 + 0) / 3 - 0 = 3.333 -> 3
    const totals = resolve({
      pointTypeIds: ['p'],
      startingSums: { p: 10 },
      mutators: { p: { multipliers: [], dividers: [3] } },
    });
    expect(totals.p).toBe(3);
  });

  it('resolves an id multiplier against the referenced point type total', () => {
    // q total = (4 + 0) * 2 = 8 ; p total = (3 + 0) * 8 = 24
    const totals = resolve({
      pointTypeIds: ['p', 'q'],
      startingSums: { p: 3, q: 4 },
      mutators: {
        p: { multipliers: [{ kind: 'ref', pointTypeId: 'q' }], dividers: [] },
        q: { multipliers: [{ kind: 'const', value: 2 }], dividers: [] },
      },
    });
    expect(totals.q).toBe(8);
    expect(totals.p).toBe(24);
  });

  it('resolves a chain a -> b -> c in dependency order', () => {
    // c = 2 ; b = 3 * c = 6 ; a = 4 * b = 24
    const totals = resolve({
      pointTypeIds: ['a', 'b', 'c'],
      startingSums: { a: 4, b: 3, c: 2 },
      mutators: {
        a: { multipliers: [{ kind: 'ref', pointTypeId: 'b' }], dividers: [] },
        b: { multipliers: [{ kind: 'ref', pointTypeId: 'c' }], dividers: [] },
      },
    });
    expect(totals).toEqual({ a: 24, b: 6, c: 2 });
  });

  it('breaks a two-cycle by using startingSum for the back-edge only', () => {
    // a depends on b, b depends on a.
    // a computed first: b is in progress -> b factor = startingSum(a) = 2
    //   b = (3) * 2 = 6 ; a = (2) * 6 = 12
    const totals = resolve({
      pointTypeIds: ['a', 'b'],
      startingSums: { a: 2, b: 3 },
      mutators: {
        a: { multipliers: [{ kind: 'ref', pointTypeId: 'b' }], dividers: [] },
        b: { multipliers: [{ kind: 'ref', pointTypeId: 'a' }], dividers: [] },
      },
    });
    expect(totals).toEqual({ a: 12, b: 6 });
  });

  it('breaks a self-reference with startingSum', () => {
    // a = (5) * startingSum(a=5) = 25
    const totals = resolve({
      pointTypeIds: ['a'],
      startingSums: { a: 5 },
      mutators: {
        a: { multipliers: [{ kind: 'ref', pointTypeId: 'a' }], dividers: [] },
      },
    });
    expect(totals.a).toBe(25);
  });

  it('treats a zero constant multiplier as wiping the gain', () => {
    // (10 + 5) * 0 - 4 = -4
    const totals = resolve({
      pointTypeIds: ['p'],
      startingSums: { p: 10 },
      gains: { p: 5 },
      costs: { p: 4 },
      mutators: {
        p: { multipliers: [{ kind: 'const', value: 0 }], dividers: [] },
      },
    });
    expect(totals.p).toBe(-4);
  });
});
