import type { ConditionTerm } from '~/composables/project/types/v2/condition';

export enum ScoreType {
  Gain = 'gain',
  Cost = 'cost',
}

export interface ObjectScore {
  scoreId: string;
  type: ScoreType;

  value: number;
  when: ConditionTerm;
}

export interface ProjectScore {
  id: string;

  // Score name (i.e. Shard Points)
  title: string;
  // Score unit (i.e. SP)
  unit: string;

  defaultValue: number;
}
