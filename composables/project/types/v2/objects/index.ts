import type {
  AddonObject,
  ChoiceObject,
} from '~/composables/project/types/v2/objects/choice';
import type { PageObject } from '~/composables/project/types/v2/objects/page';
import type { RowObject } from '~/composables/project/types/v2/objects/row';

export type * from '~/composables/project/types/v2/objects/choice';
export type * from '~/composables/project/types/v2/objects/page';
export type * from '~/composables/project/types/v2/objects/row';

export type AnyObject = PageObject | RowObject | ChoiceObject | AddonObject;
