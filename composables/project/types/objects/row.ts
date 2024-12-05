import type {
  ObjectBase,
  ObjectType,
} from '~/composables/project/types/objects/base';
import type { Conditions } from '~/composables/project/types/objects/components/condition';
import type { RowHeader } from '~/composables/project/types/objects/components/header';

export interface RowObject extends ObjectBase {
  type: ObjectType.row;
  name: string;

  style?: string;
  header?: RowHeader;

  requirements?: {
    // Condition to display the row
    display?: Conditions;
    // Condition that applies to all choices
    choices?: Conditions;
  };
}
