import * as R from 'ramda';
import { P, match } from 'ts-pattern';

import { ConditionTerm, HasRequirements } from '~/composables/project';

export type Term = (selected: string[]) => boolean;
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

  // eslint-disable-next-line no-new-func
  const func = Function('sel', `return ${code}`);
  return {
    exec: func as Term,
    deps,
  };
};

const buildCondition = (term: ConditionTerm): Condition => {
  return match(term)
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
    .otherwise(() => ALWAYS);
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
