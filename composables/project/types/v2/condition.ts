export type IsSelectedCondition = { isSelected: string };
export type IsNotSelectedCondition = { isNotSelected: string };

export type AllOfCondition = { all: ConditionTerm[] };
export type AnyOfCondition = { all: ConditionTerm[] };

export type ConditionTerm =
  | AllOfCondition
  | AnyOfCondition
  | IsSelectedCondition
  | IsNotSelectedCondition;
