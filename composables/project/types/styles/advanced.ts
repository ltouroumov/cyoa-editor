import type {
  StyleTarget,
  StyleType,
} from '~/composables/project/types/styles/base';
import type {
  BaseStyle,
  SimpleStyle,
} from '~/composables/project/types/styles/index';

export type ComponentStyle = string[] | { add?: string[]; remove?: string[] };

/**
 * Advanced project style framework
 * Allows the user to specify the Tailwind classes for each component
 */
export interface AdvancedStyle extends BaseStyle {
  type: StyleType.advanced;
}

export interface AdvancedPageStyle extends SimpleStyle {
  target: StyleTarget.row;

  header?: {
    container?: ComponentStyle;
  };

  contents?: ComponentStyle;
}

export interface AdvancedRowStyle extends SimpleStyle {
  target: StyleTarget.row;

  header?: {
    container?: ComponentStyle;
    image?: ComponentStyle;
    title?: ComponentStyle;
    text?: ComponentStyle;
  };

  contents?: ComponentStyle;
}

export interface AdvancedChoiceStyle extends SimpleStyle {
  target: StyleTarget.choice;

  header?: {
    container?: ComponentStyle;
    image?: ComponentStyle;
    title?: ComponentStyle;
    text?: ComponentStyle;
  };

  contents?: ComponentStyle;
}

export type AnyAdvancedStyle =
  | AdvancedPageStyle
  | AdvancedRowStyle
  | AdvancedChoiceStyle;
