export type AlwaysCondition = { always: true };
export type IsSelectedCondition = { isSelected: string };
export type IsNotSelectedCondition = { isNotSelected: string };

export type AllOfCondition = { allOf: ConditionTerm[] };
export type AnyOfCondition = { anyOf: ConditionTerm[] };

export type ConditionTerm =
  | AllOfCondition
  | AnyOfCondition
  | AlwaysCondition
  | IsSelectedCondition
  | IsNotSelectedCondition;

export function isAllOfTerm(term: ConditionTerm): term is AllOfCondition {
  return 'allOf' in term;
}

export function isAnyOfTerm(term: ConditionTerm): term is AnyOfCondition {
  return 'anyOf' in term;
}

export function isSelectedTerm(
  term: ConditionTerm,
): term is IsSelectedCondition {
  return 'isSelected' in term;
}

export function isNotSelectedTerm(
  term: ConditionTerm,
): term is IsNotSelectedCondition {
  return 'isNotSelected' in term;
}

export function isAlwaysTerm(term: ConditionTerm): term is AlwaysCondition {
  return 'always' in term && term.always;
}
