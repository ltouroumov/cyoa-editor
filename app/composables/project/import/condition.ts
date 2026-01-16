import * as R from 'ramda';
import {
  chain,
  concat,
  head,
  identity,
  isEmpty,
  map,
  partition,
  prop,
} from 'ramda';
import { P, match } from 'ts-pattern';

import type { ConditionTerm as ConditionTermV1 } from '~/composables/project/types/v1';
import {
  type AllOfCondition,
  type AnyOfCondition,
  type ConditionTerm,
  isAlwaysTerm,
} from '~/composables/project/types/v2/condition';

export function toConditionTerm(
  terms: ConditionTermV1[],
): ConditionTerm | undefined {
  const AllOf = (terms: ConditionTerm[]): ConditionTerm => ({ allOf: terms });
  const AnyOf = (terms: ConditionTerm[]): ConditionTerm => ({ anyOf: terms });
  const IsSelected = (id: string): ConditionTerm => ({ isSelected: id });
  const IsNotSelected = (id: string): ConditionTerm => ({ isNotSelected: id });

  function buildCondition(term: ConditionTermV1): ConditionTerm {
    // Compute the base condition microcode
    const base = match(term)
      .with({ type: 'id', required: true }, (): ConditionTerm => {
        const ids = R.reject(R.isEmpty, [
          term.reqId,
          term.reqId1,
          term.reqId2,
          term.reqId3,
        ]);
        return AllOf(R.map(IsSelected, ids));
      })
      .with({ type: 'id', required: false }, (): ConditionTerm => {
        const ids = R.reject(R.isEmpty, [
          term.reqId,
          term.reqId1,
          term.reqId2,
          term.reqId3,
        ]);
        return AllOf(R.map(IsNotSelected, ids));
      })
      .with(
        { type: 'or', required: true, orRequired: P.select() },
        (orRequired): ConditionTerm => {
          const ids = R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
          return AnyOf(R.map(IsSelected, ids));
        },
      )
      .with(
        { type: 'or', required: false, orRequired: P.select() },
        (orRequired): ConditionTerm => {
          const ids = R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
          return AnyOf(R.map(IsNotSelected, ids));
        },
      )
      .otherwise((): ConditionTerm => ({ always: true }));

    if (isEmpty(term.requireds)) {
      return base;
    } else {
      // Handle sub-conditions
      const inner: ConditionTerm[] = map(buildCondition, term.requireds);
      return AllOf([base, ...inner]);
    }
  }

  function simplify(term: ConditionTerm): ConditionTerm {
    return match(term)
      .with({ allOf: P.select() }, (terms: ConditionTerm[]): ConditionTerm => {
        const [allOfChildren, otherChildren] = partition(
          (term): term is AllOfCondition => 'allOf' in term,
          terms,
        );
        // Flatten all children of the same type into this level
        const flatChildren = chain(prop('allOf'), allOfChildren);
        // Concatenate all children and recursively simplify
        const simplified = map(simplify, concat(flatChildren, otherChildren));
        if (simplified.length === 0) {
          return { always: true };
        } else if (simplified.length === 1) {
          return head(simplified)!;
        } else {
          return AllOf(simplified);
        }
      })
      .with({ anyOf: P.select() }, (terms: ConditionTerm[]): ConditionTerm => {
        const [anyOfChildren, otherChildren] = partition(
          (term): term is AnyOfCondition => 'anyOf' in term,
          terms,
        );
        // Flatten all children of the same type into this level
        const flatChildren = chain(prop('anyOf'), anyOfChildren);
        // Concatenate all children and recursively simplify
        const simplified = map(simplify, concat(flatChildren, otherChildren));
        if (simplified.length === 0) {
          return { always: true };
        } else if (simplified.length === 1) {
          return head(simplified)!;
        } else {
          return AnyOf(simplified);
        }
      })
      .otherwise(identity);
  }

  const simplified = simplify(AllOf(map(buildCondition, terms)));
  if (isAlwaysTerm(simplified)) {
    return undefined;
  } else {
    return simplified;
  }
}
