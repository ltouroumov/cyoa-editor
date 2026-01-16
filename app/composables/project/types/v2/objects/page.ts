import type {
  ObjectBase,
  ObjectType,
} from '~/composables/project/types/v2/objects/base';

export interface PageObject extends ObjectBase {
  type: ObjectType.page;
  name: string;

  styles?: string[];
}
