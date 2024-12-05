import type { ConditionTerm } from '~/composables/project/types/condition';
import type { ObjectCondition } from '~/composables/project/types/objects/components/condition';
import type { ObjectScore } from '~/composables/project/types/score';

export enum ComponentType {
  Visibility = 'visibility',
  Scores = 'price',
  Requirements = 'requirements',
  MultiSelect = 'multi-select',
}

export interface BaseComponent<T extends ComponentType> {
  type: T;
}

export interface VisibilityComponent
  extends BaseComponent<ComponentType.Visibility> {
  condition: ConditionTerm;
}

export interface RequirementsComponent
  extends BaseComponent<ComponentType.Requirements> {
  requirements: ObjectCondition[];
}

export interface MultiSelectComponent
  extends BaseComponent<ComponentType.MultiSelect> {
  minAmount: number;
  maxAmount: number;
}

export interface ScoresComponent extends BaseComponent<ComponentType.Scores> {
  scores: ObjectScore[];
}

export type ComponentMap = Partial<{
  [ComponentType.Scores]: ScoresComponent;
  [ComponentType.Visibility]: VisibilityComponent;
  [ComponentType.Requirements]: RequirementsComponent;
  [ComponentType.MultiSelect]: MultiSelectComponent;
}>;
