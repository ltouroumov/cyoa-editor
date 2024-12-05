import type {
  AddonObject,
  ChoiceObject,
} from '~/composables/project/types/objects/choice';
import type { PageObject } from '~/composables/project/types/objects/page';
import type { RowObject } from '~/composables/project/types/objects/row';

export type * from '~/composables/types/objects/header';
export type * from '~/composables/types/objects/choice';
export type * from '~/composables/types/objects/page';
export type * from '~/composables/types/objects/row';

export type AnyObject = PageObject | RowObject | ChoiceObject | AddonObject;
