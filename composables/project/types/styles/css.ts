import type {
  BaseStyle,
  StyleTarget,
  StyleType,
} from '~/composables/project/types/styles/base';

export interface CSSRules {
  [key: string]: string;
}

/**
 * CSS project style framework
 * Allows the user to specify CSS rules for each component
 */
export interface CSSStyle extends BaseStyle {
  type: StyleType.css;
  target: StyleTarget;

  // Specify the rules for each component pointer
  rules: Record<string, CSSRules>;
}
