import type { EntityType } from '~/composables/project/types/v2/base';
import type { ProjectImage } from '~/composables/project/types/v2/media';
import type { AnyObject } from '~/composables/project/types/v2/objects';
import type { ProjectScore } from '~/composables/project/types/v2/score';
import type { AnyStyle } from '~/composables/project/types/v2/styles';

export type ClipboardItem =
  | { type: EntityType.Object; id: string; data: AnyObject; from?: string }
  | { type: EntityType.Score; id: string; data: ProjectScore }
  | { type: EntityType.Image; id: string; data: ProjectImage }
  | { type: EntityType.Style; id: string; data: AnyStyle };
