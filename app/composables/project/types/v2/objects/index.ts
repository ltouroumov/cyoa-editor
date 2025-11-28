import type { ObjectType } from '~/composables/project/types/v2/objects/base';
import type {
  AddonObject,
  ChoiceObject,
} from '~/composables/project/types/v2/objects/choice';
import type { LayoutChildProps } from '~/composables/project/types/v2/objects/layout';
import type { PageObject } from '~/composables/project/types/v2/objects/page';
import type { RowObject } from '~/composables/project/types/v2/objects/row';

export type * from '~/composables/project/types/v2/objects/choice';
export type * from '~/composables/project/types/v2/objects/page';
export type * from '~/composables/project/types/v2/objects/row';

export interface ChildObject {
  id: string;
  layout?: LayoutChildProps;
}

export type AnyObject = PageObject | RowObject | ChoiceObject | AddonObject;
export type ObjectMap = {
  [ObjectType.page]: PageObject;
  [ObjectType.row]: RowObject;
  [ObjectType.choice]: ChoiceObject;
  [ObjectType.addon]: AddonObject;
};
