import { ConditionType } from '~/composables/project/types/v2/objects/components/condition';

export const GridItemPositions: { label: string; value: string }[] = [
  { label: 'Left-Aligned', value: 'left' },
  { label: 'Centered', value: 'center' },
  { label: 'Right-Aligned', value: 'right' },
];

export const GridItemWidths: { label: string; value: number }[] = [
  { label: 'Full Width', value: 60 },
  { label: '1/2 Width', value: 30 },
  { label: '1/3 Width', value: 20 },
  { label: '1/4 Width', value: 15 },
  { label: '1/5 Width', value: 12 },
  { label: '1/10 Width', value: 6 },
  { label: '11/12 Columns', value: 55 },
  { label: '10/12 Columns', value: 50 },
  { label: '9/12 Columns', value: 45 },
  { label: '8/12 Columns', value: 40 },
  { label: '7/12 Columns', value: 35 },
  { label: '5/12 Columns', value: 25 },
  { label: '2/12 Columns', value: 10 },
  { label: '1/12 Columns', value: 5 },
];

export const ConditionTypes: { label: string; value: ConditionType }[] = [
  { label: 'Required', value: ConditionType.required },
  { label: 'Incompatible', value: ConditionType.incompatible },
];
