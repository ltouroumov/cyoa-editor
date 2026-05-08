import type { ConditionTerm } from '~/composables/project/types/v2/condition';

export enum ScoreType {
  Gain = 'gain',
  Cost = 'cost',
  Set = 'set',
}

export interface ObjectScore {
  id: string;
  scoreId: string;
  type: ScoreType;

  value: number;
  activeWhen?: ConditionTerm;
  hidden?: boolean;
}

export interface ProjectScore {
  id: string;

  // Score name (i.e. Shard Points)
  title: string;
  // Score unit (i.e. SP)
  unit: string;

  defaultValue: number;

  activeWhen?: ConditionTerm;
}
