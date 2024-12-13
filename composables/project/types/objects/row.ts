import type { ConditionTerm } from '~/composables/project/types/condition';
import type {
  ObjectBase,
  ObjectType,
} from '~/composables/project/types/objects/base';
import type { RowHeader } from '~/composables/project/types/objects/components/header';

export interface RowObject extends ObjectBase {
  type: ObjectType.row;
  name: string;

  style?: string;
  header?: RowHeader;

  requirements?: {
    // Condition to display the row
    display?: ConditionTerm;
    // Condition that applies to all choices
    choices?: ConditionTerm;
  };
}
