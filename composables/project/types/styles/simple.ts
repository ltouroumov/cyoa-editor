import type { StyleType } from '~/composables/project/types/styles/base';
import type {
  BaseStyle,
  StyleTarget,
} from '~/composables/project/types/styles/index';

export interface SimpleTextStyle {
  fontFamily?: string;
  fontSize?: string;
  textColor?: string;
}

export interface SimpleBorderStyle {
  enabled?: boolean;
  style?: string;
  width?: string;
  color?: string;
  radius?: string;
}

export interface SimpleBackgroundStyle {
  color?: string;
  imageUrl?: string;
}

export interface SimpleMarginStyle {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

/**
 * Simple project style framework
 * UI-based configuration with limited scope
 */
export interface SimpleStyle extends BaseStyle {
  type: StyleType.simple;
}

export interface SimplePageStyle extends SimpleStyle {
  target: StyleTarget.row;

  header?: {
    margins?: SimpleMarginStyle;
    background?: SimpleBackgroundStyle;
  };

  contents: {
    margins?: SimpleMarginStyle;
    layout?: 'list' | 'grid';
    gap?: string;
  };
}

export interface SimpleRowStyle extends SimpleStyle {
  target: StyleTarget.row;

  header?: {
    margins?: SimpleMarginStyle;
    background?: SimpleBackgroundStyle;
    border?: SimpleBorderStyle;
    title?: SimpleTextStyle;
    text?: SimpleTextStyle;
  };

  contents: {
    margins?: SimpleMarginStyle;
    layout?: 'list' | 'grid';
    gap?: string;
  };
}

export interface SimpleChoiceStyle extends SimpleStyle {
  target: StyleTarget.choice;

  header?: {
    margins?: SimpleMarginStyle;
    background?: SimpleBackgroundStyle;
    border?: SimpleBorderStyle;
    title?: SimpleTextStyle;
    text?: SimpleTextStyle;
  };

  contents: {
    margins?: SimpleMarginStyle;
    layout?: 'list' | 'grid';
    gap?: string;
  };
}

export type AnySimpleStyle =
  | SimplePageStyle
  | SimpleRowStyle
  | SimpleChoiceStyle;
