import type { ConditionTerm } from '~/composables/project/types/v2/condition';

export enum ConditionType {
  required = 'required',
  incompatible = 'incompatible',
}

export enum ConditionMode {
  any = 'any',
  all = 'all',
}

export type ObjectCondition = {
  id: string;
  type: ConditionType;
  mode: ConditionMode;
  objectIds: string[];
  activeWhen?: ConditionTerm;

  display?: boolean;
  beforeText?: string;
  afterText?: string;
  termText?: string;
};
