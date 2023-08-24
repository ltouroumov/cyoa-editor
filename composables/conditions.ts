import { ConditionTerm, HasConditions } from '~/composables/project';
import { match, P } from 'ts-pattern';
import * as R from 'ramda';

type Term = (selected: string[]) => boolean;
type Condition = {
  exec: Term;
  deps: string[]
};

export const buildConditions = (item: HasConditions): Term =>
  buildRootCondition(item.requireds);

const buildRootCondition = (terms: ConditionTerm[]): Term => {
  if (terms.length === 0)
    return () => true;
  else {
    let { exec, deps } = AND(R.map(buildCondition, terms));
    return (selected) => exec(selected);
  }
}

const buildCondition = (term: ConditionTerm): Condition => {
  return match(term)
    .with({ type: 'id', required: true }, () => {
      const ids = R.reject(R.isEmpty, [term.reqId, term.reqId1, term.reqId2, term.reqId3]);
      return AND(R.map(SELECTED, ids));
    })
    .with({ type: 'id', required: false }, () => {
      const ids = R.reject(R.isEmpty, [term.reqId, term.reqId1, term.reqId2, term.reqId3]);
      return AND(R.map(UNSELECTED, ids));
    })
    .with({ type: 'or', required: true, orRequired: P.select() }, (orRequired) => {
      const ids = R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
      return OR(R.map(SELECTED, ids));
    })
    .otherwise(() => ALWAYS)
}

const mergeDeps = (terms: Condition[]) =>
  R.uniq(R.flatten(R.map(R.prop('deps'), terms)));

const combine = (fn: (ev: Term[]) => Term, terms: Condition[]): Condition => ({
  exec: fn(R.map(R.prop('exec'), terms)),
  deps: mergeDeps(terms),
})

const ALWAYS: Condition = { exec: () => true, deps: [] };
const NEVER: Condition = { exec: () => false, deps: [] };

const SELECTED = (id: string): Condition => ({ exec: R.includes(id), deps: [id] });
const UNSELECTED = (id: string): Condition => ({ exec: (s) => !R.includes(id, s), deps: [id] });

const AND = (terms: Condition[]): Condition => {
  if (terms.length === 0) return ALWAYS;
  else if (terms.length === 1) return terms[0];
  else return combine(R.allPass, terms);
}

const OR = (terms: Condition[]): Condition => {
  if (terms.length === 0) return ALWAYS;
  else if (terms.length === 1) return terms[0];
  else return combine(R.anyPass, terms);
}