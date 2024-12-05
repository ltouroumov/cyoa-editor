import type { AnyAdvancedStyle } from '~/composables/project/types/styles/advanced';
import type { CSSStyle } from '~/composables/project/types/styles/css';
import type { AnySimpleStyle } from '~/composables/project/types/styles/simple';

export type * from '~/composables/project/types/styles/base';
export type * from '~/composables/project/types/styles/simple';
export type * from '~/composables/project/types/styles/advanced';
export type * from '~/composables/project/types/styles/css';

export type AnyStyle = AnySimpleStyle | AnyAdvancedStyle | CSSStyle;
