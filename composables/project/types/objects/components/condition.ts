import type { ConditionTerm } from '~/composables/project/types/condition';

export enum ConditionType {
  required = 'required',
  incompatible = 'incompatible',
}

export type ObjectCondition = {
  id: string;
  type: ConditionType;
  objectIds: string[];
  activeWhen?: ConditionTerm;

  display?: boolean;
  beforeText?: string;
  afterText?: string;
  termText?: string;
};
