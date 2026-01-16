import type {
  ObjectBase,
  ObjectType,
} from '~/composables/project/types/v2/objects/base';
import type { ComponentMap } from '~/composables/project/types/v2/objects/components/choice';
import type {
  AddonHeader,
  ChoiceHeader,
} from '~/composables/project/types/v2/objects/components/header';

export interface ChoiceObject extends ObjectBase {
  type: ObjectType.choice;
  name: string;

  styles?: string[];

  header: ChoiceHeader;

  // All features are achieved through data-driven components
  components: ComponentMap;
}

export interface AddonObject extends ObjectBase {
  type: ObjectType.addon;
  name: string;

  styles?: string[];
  header: AddonHeader;
  components: ComponentMap;
}
