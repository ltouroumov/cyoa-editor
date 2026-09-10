import * as R from 'ramda';
import { isEmpty, map } from 'ramda';
import { P, match } from 'ts-pattern';

import type {
  ConditionTerm,
  HasRequirements,
} from '~/composables/project/types/v1';

export type PointTotals = Record<string, number>;
export type Term = (selected: string[], points: PointTotals) => boolean;
export type Condition = {
  code: string;
  deps: string[];
};

export type ConditionExec = {
  exec: Term;
  deps: string[];
};

export const buildConditions = (item: HasRequirements): Term => {
  const { exec } = buildRootCondition(item.requireds);
  return exec;
};

export const buildRootCondition = (terms: ConditionTerm[]): ConditionExec => {
  const { code, deps } =
    terms.length === 0 ? ALWAYS : AND(R.map(buildCondition, terms));

  const func = Function('sel', 'pts', `return ${code}`);
  return {
    exec: func as Term,
    deps,
  };
};

const buildCondition = (term: ConditionTerm): Condition => {
  // Compute the base condition microcode
  const base = match(term)
    .with({ type: 'id', required: true }, () => {
      const ids = R.reject(R.isEmpty, [
        term.reqId,
        term.reqId1,
        term.reqId2,
        term.reqId3,
      ]);
      return AND(R.map(SELECTED, ids));
    })
    .with({ type: 'id', required: false }, () => {
      const ids = R.reject(R.isEmpty, [
        term.reqId,
        term.reqId1,
        term.reqId2,
        term.reqId3,
      ]);
      return AND(R.map(UNSELECTED, ids));
    })
    .with(
      { type: 'or', required: true, orRequired: P.select() },
      (orRequired) => {
        const ids = R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
        return OR(R.map(SELECTED, ids));
      },
    )
    .with(
      { type: 'or', required: false, orRequired: P.select() },
      (orRequired) => {
        const ids = R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
        return OR(R.map(UNSELECTED, ids));
      },
    )
    .with({ type: 'points', required: true }, () => POINTS(term))
    .with({ type: 'points', required: false }, () => {
      const cond = POINTS(term);
      return cond === ALWAYS ? ALWAYS : NOT(cond);
    })
    .with({ type: 'pointCompare', required: true }, () => POINT_COMPARE(term))
    .with({ type: 'pointCompare', required: false }, () => {
      const cond = POINT_COMPARE(term);
      return cond === ALWAYS ? ALWAYS : NOT(cond);
    })
    .otherwise(() => ALWAYS);

  if (isEmpty(term.requireds)) {
    return base;
  } else {
    // Handle sub-conditions
    const inner = map(buildCondition, term.requireds);
    return ALT(AND(inner), base, ALWAYS);
  }
};

const mergeDeps = (terms: Condition[]) =>
  R.uniq(R.flatten(R.map(R.prop('deps'), terms)));

const combine = (
  fn: (ev: string[]) => string,
  terms: Condition[],
): Condition => ({
  code: fn(R.map(R.prop('code'), terms)),
  deps: mergeDeps(terms),
});

const ALWAYS: Condition = { code: 'true', deps: [] };

const SELECTED = (id: string): Condition => ({
  code: `sel.includes(${JSON.stringify(id)})`,
  deps: [id],
});
const UNSELECTED = (id: string): Condition => ({
  code: `!sel.includes(${JSON.stringify(id)})`,
  deps: [id],
});

const NOT = (cond: Condition): Condition => ({
  code: `!(${cond.code})`,
  deps: cond.deps,
});

const POINT_SUM = (id: string): string => `(pts[${JSON.stringify(id)}] ?? 0)`;

// Legacy `type: points` operator numbering (stores/main.js).
// Absent operator behaves as `>=`; an unmapped value passes (always true).
const POINTS_OPERATORS: Record<number, string> = {
  1: '>',
  2: '>=',
  3: '==',
  4: '<=',
  5: '<',
};

// Legacy `type: pointCompare` uses a *different* numbering (1 >, 2 ==, 3 >=).
const POINT_COMPARE_OPERATORS: Record<number, string> = {
  1: '>',
  2: '==',
  3: '>=',
};

const POINTS = (term: ConditionTerm): Condition => {
  const threshold = Number(term.reqPoints);
  if (!Number.isFinite(threshold)) return ALWAYS;

  const operator =
    term.operator === undefined ? '>=' : POINTS_OPERATORS[term.operator];
  if (operator === undefined) return ALWAYS;

  const lhs = POINT_SUM(term.reqId);
  // Legacy compares equality with parseInt on both sides.
  const code =
    operator === '=='
      ? `Math.trunc(${lhs}) === Math.trunc(${String(threshold)})`
      : `${lhs} ${operator} ${String(threshold)}`;
  return { code, deps: [] };
};

const POINT_COMPARE = (term: ConditionTerm): Condition => {
  const operator =
    term.operator === undefined
      ? undefined
      : POINT_COMPARE_OPERATORS[term.operator];
  if (operator === undefined) return ALWAYS;

  const lhs = POINT_SUM(term.reqId);
  const rhs = POINT_SUM(term.reqId1);
  const code =
    operator === '==' ? `${lhs} === ${rhs}` : `${lhs} ${operator} ${rhs}`;
  return { code, deps: [] };
};

const AND = (terms: Condition[]): Condition => {
  if (terms.length === 0) return ALWAYS;
  else if (terms.length === 1) return terms[0];
  else
    return combine(
      R.pipe(
        R.map((c) => `(${c})`),
        R.join(' && '),
      ),
      terms,
    );
};

const OR = (terms: Condition[]): Condition => {
  if (terms.length === 0) return ALWAYS;
  else if (terms.length === 1) return terms[0];
  else
    return combine(
      R.pipe(
        R.map((c) => `(${c})`),
        R.join(' || '),
      ),
      terms,
    );
};

const ALT = (
  pred: Condition,
  ifTrue: Condition,
  ifFalse: Condition,
): Condition => {
  return {
    code: `(${pred.code}) ? (${ifTrue.code}) : (${ifFalse.code})`,
    deps: mergeDeps([pred, ifTrue, ifFalse]),
  };
};
