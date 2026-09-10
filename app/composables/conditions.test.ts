import { describe, expect, it } from 'vitest';

import { buildRootCondition } from './conditions';

import type { ConditionTerm } from '~/composables/project/types/v1';

const term = (over: Partial<ConditionTerm>): ConditionTerm =>
  ({
    id: 't',
    reqId: '',
    reqId1: '',
    reqId2: '',
    reqId3: '',
    orRequired: [],
    required: true,
    showRequired: false,
    type: 'id',
    requireds: [],
    beforeText: '',
    afterText: '',
    ...over,
  }) as ConditionTerm;

const run = (
  terms: ConditionTerm[],
  selected: string[],
  points: Record<string, number> = {},
) => buildRootCondition(terms).exec(selected, points);

describe('buildRootCondition — id / or regression', () => {
  it('still evaluates a required id term with the 2-arg signature', () => {
    const t = term({ type: 'id', required: true, reqId: 'a' });
    expect(run([t], ['a'])).toBe(true);
    expect(run([t], ['b'])).toBe(false);
  });

  it('still evaluates an incompatible id term', () => {
    const t = term({ type: 'id', required: false, reqId: 'a' });
    expect(run([t], ['a'])).toBe(false);
    expect(run([t], [])).toBe(true);
  });

  it('still evaluates an or term', () => {
    const t = term({
      type: 'or',
      required: true,
      orRequired: [{ req: 'a' }, { req: 'b' }],
    });
    expect(run([t], ['b'])).toBe(true);
    expect(run([t], ['c'])).toBe(false);
  });
});

describe('buildRootCondition — type: points', () => {
  const pts = (op: number | undefined, reqPoints: number): ConditionTerm =>
    term({
      type: 'points',
      required: true,
      reqId: 'P',
      operator: op,
      reqPoints,
    });

  it('absent operator behaves as >=', () => {
    expect(run([pts(undefined, 10)], [], { P: 10 })).toBe(true);
    expect(run([pts(undefined, 10)], [], { P: 9 })).toBe(false);
  });

  it('operator 1 is strictly greater than', () => {
    expect(run([pts(1, 10)], [], { P: 11 })).toBe(true);
    expect(run([pts(1, 10)], [], { P: 10 })).toBe(false);
  });

  it('operator 2 is greater or equal', () => {
    expect(run([pts(2, 10)], [], { P: 10 })).toBe(true);
    expect(run([pts(2, 10)], [], { P: 9 })).toBe(false);
  });

  it('operator 3 is equality (truncated)', () => {
    expect(run([pts(3, 10)], [], { P: 10 })).toBe(true);
    expect(run([pts(3, 10)], [], { P: 10.7 })).toBe(true);
    expect(run([pts(3, 10)], [], { P: 11 })).toBe(false);
  });

  it('operator 4 is less or equal', () => {
    expect(run([pts(4, 10)], [], { P: 10 })).toBe(true);
    expect(run([pts(4, 10)], [], { P: 11 })).toBe(false);
  });

  it('operator 5 is strictly less than', () => {
    expect(run([pts(5, 10)], [], { P: 9 })).toBe(true);
    expect(run([pts(5, 10)], [], { P: 10 })).toBe(false);
  });

  it('treats a missing point type as zero', () => {
    expect(run([pts(2, 10)], [], {})).toBe(false);
    expect(run([pts(5, 10)], [], {})).toBe(true);
  });

  it('required: false inverts the whole term', () => {
    const t = term({
      type: 'points',
      required: false,
      reqId: 'P',
      operator: 2,
      reqPoints: 10,
    });
    expect(run([t], [], { P: 10 })).toBe(false);
    expect(run([t], [], { P: 9 })).toBe(true);
  });

  it('falls through to always-true when reqPoints is not finite', () => {
    const t = term({
      type: 'points',
      required: true,
      reqId: 'P',
      operator: 2,
      reqPoints: undefined,
    });
    expect(run([t], [], { P: 0 })).toBe(true);
  });
});

describe('buildRootCondition — type: pointCompare', () => {
  const cmp = (op: number): ConditionTerm =>
    term({
      type: 'pointCompare',
      required: true,
      reqId: 'A',
      reqId1: 'B',
      operator: op,
    });

  it('operator 1 is A > B', () => {
    expect(run([cmp(1)], [], { A: 5, B: 3 })).toBe(true);
    expect(run([cmp(1)], [], { A: 3, B: 3 })).toBe(false);
  });

  it('operator 2 is A == B', () => {
    expect(run([cmp(2)], [], { A: 3, B: 3 })).toBe(true);
    expect(run([cmp(2)], [], { A: 4, B: 3 })).toBe(false);
  });

  it('operator 3 is A >= B', () => {
    expect(run([cmp(3)], [], { A: 3, B: 3 })).toBe(true);
    expect(run([cmp(3)], [], { A: 2, B: 3 })).toBe(false);
  });

  it('treats missing operands as zero', () => {
    expect(run([cmp(3)], [], {})).toBe(true);
    expect(run([cmp(1)], [], {})).toBe(false);
  });

  it('required: false inverts the whole term', () => {
    const t = term({
      type: 'pointCompare',
      required: false,
      reqId: 'A',
      reqId1: 'B',
      operator: 1,
    });
    expect(run([t], [], { A: 5, B: 3 })).toBe(false);
    expect(run([t], [], { A: 1, B: 3 })).toBe(true);
  });
});
