import type {
  ObjectBase,
  ObjectType,
} from '~/composables/project/types/objects/base';

export interface PageObject extends ObjectBase {
  type: ObjectType.page;
  name: string;
}
