import type { AnyObject } from '~/composables/project/types/v2/objects';
import type { AnyStyle } from '~/composables/project/types/v2/styles';

export type ClipboardItem =
  | { type: 'object'; id: string; data: AnyObject; from?: string }
  | { type: 'style'; id: string; data: AnyStyle };
