import type { AnyAdvancedStyle } from '~/composables/project/types/v2/styles/advanced';
import type { CSSStyle } from '~/composables/project/types/v2/styles/css';
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles/simple';

export type { BaseStyle } from '~/composables/project/types/v2/styles/base';
export {
  StyleType,
  StyleTarget,
} from '~/composables/project/types/v2/styles/base';
export type * from '~/composables/project/types/v2/styles/simple';
export type * from '~/composables/project/types/v2/styles/advanced';
export type * from '~/composables/project/types/v2/styles/css';

export type AnyStyle = AnySimpleStyle | AnyAdvancedStyle | CSSStyle;
