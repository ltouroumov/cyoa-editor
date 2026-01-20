import type {
  ObjStyles,
  RowStyles,
} from '~/composables/project/types/v1/styles';
import { createId } from '~/composables/project/types/v2/id';
import {
  type SimpleChoiceStyle,
  type SimpleRowStyle,
  StyleTarget,
  StyleType,
} from '~/composables/project/types/v2/styles';

/**
 * Convert V1 border radius value to V2 format (px or %)
 */
function convertBorderRadius(
  topLeft: string | number | undefined,
  topRight: string | number | undefined,
  bottomRight: string | number | undefined,
  bottomLeft: string | number | undefined,
  isPixels: boolean | undefined,
): string | undefined {
  // If all values are undefined or empty, return undefined
  if (
    topLeft === undefined &&
    topRight === undefined &&
    bottomRight === undefined &&
    bottomLeft === undefined
  ) {
    return undefined;
  }

  const unit = isPixels ? 'px' : '%';
  const tl = topLeft ?? 0;
  const tr = topRight ?? 0;
  const br = bottomRight ?? 0;
  const bl = bottomLeft ?? 0;

  // If all values are the same, return a single value
  if (tl === tr && tr === br && br === bl) {
    return `${tl}${unit}`;
  }

  // Otherwise return all four values
  return `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`;
}

/**
 * Convert V1 margin/padding value to V2 format
 */
function convertSpacing(
  value: number | string | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  return `${value}px`;
}

/**
 * Convert V1 row-specific styles to V2 SimpleRowStyle
 */
export function convertRowStyles(
  v1Styles: RowStyles,
  name: string,
): SimpleRowStyle {
  const id = createId('style');

  return {
    id,
    type: StyleType.simple,
    target: StyleTarget.row,
    name: name,

    header: {
      margins: {
        top: convertSpacing(v1Styles.rowBodyMarginTop),
        right: convertSpacing(v1Styles.rowBodyMarginSides),
        bottom: convertSpacing(v1Styles.rowBodyMarginBottom),
        left: convertSpacing(v1Styles.rowBodyMarginSides),
      },
      background: {
        color: v1Styles.rowBgColorIsOn ? v1Styles.rowBgColor : undefined,
        imageUrl: v1Styles.rowBackgroundImage,
      },
      border: v1Styles.rowBorderIsOn
        ? {
            style: v1Styles.rowBorderStyle,
            width: v1Styles.rowBorderWidth
              ? `${v1Styles.rowBorderWidth}px`
              : undefined,
            color: v1Styles.rowBorderColor,
            radius: convertBorderRadius(
              v1Styles.rowBorderRadiusTopLeft,
              v1Styles.rowBorderRadiusTopRight,
              v1Styles.rowBorderRadiusBottomRight,
              v1Styles.rowBorderRadiusBottomLeft,
              v1Styles.rowBorderRadiusIsPixels,
            ),
          }
        : undefined,
      title: {
        fontFamily: v1Styles.rowTitle,
        fontSize: v1Styles.rowTitleTextSize
          ? `${v1Styles.rowTitleTextSize}%`
          : undefined,
        textColor: v1Styles.rowTitleColor,
      },
      text: {
        fontFamily: v1Styles.rowText,
        fontSize: v1Styles.rowTextTextSize
          ? `${v1Styles.rowTextTextSize}%`
          : undefined,
        textColor: v1Styles.rowTextColor,
      },
    },

    contents: {
      margins: {
        top: convertSpacing(v1Styles.objectMargin),
        right: convertSpacing(v1Styles.objectMargin),
        bottom: convertSpacing(v1Styles.objectMargin),
        left: convertSpacing(v1Styles.objectMargin),
      },
      layout: undefined,
      gap: undefined,
    },
  };
}

/**
 * Convert V1 choice/object-specific styles to V2 SimpleChoiceStyle
 */
export function convertChoiceStyles(
  v1Styles: ObjStyles,
  name: string,
): SimpleChoiceStyle {
  const id = createId('style');

  return {
    id,
    type: StyleType.simple,
    target: StyleTarget.choice,
    name: name,

    header: {
      margins: {
        top: convertSpacing(v1Styles.objectMargin),
        right: convertSpacing(v1Styles.objectMargin),
        bottom: convertSpacing(v1Styles.objectMargin),
        left: convertSpacing(v1Styles.objectMargin),
      },
      background: {
        color: v1Styles.objectBgColorIsOn ? v1Styles.objectBgColor : undefined,
        imageUrl: v1Styles.objectBackgroundImage,
      },
      border: v1Styles.objectBorderIsOn
        ? {
            style: v1Styles.objectBorderStyle,
            width: v1Styles.objectBorderWidth
              ? `${v1Styles.objectBorderWidth}px`
              : undefined,
            color: v1Styles.objectBorderColor,
            radius: convertBorderRadius(
              v1Styles.objectBorderRadiusTopLeft,
              v1Styles.objectBorderRadiusTopRight,
              v1Styles.objectBorderRadiusBottomRight,
              v1Styles.objectBorderRadiusBottomLeft,
              v1Styles.objectBorderRadiusIsPixels,
            ),
          }
        : undefined,
      title: {
        fontFamily: v1Styles.objectTitle,
        fontSize: v1Styles.objectTitleTextSize
          ? `${v1Styles.objectTitleTextSize}%`
          : undefined,
        textColor: v1Styles.objectTitleColor,
      },
      text: {
        fontFamily: v1Styles.objectText,
        fontSize: v1Styles.objectTextTextSize
          ? `${v1Styles.objectTextTextSize}%`
          : undefined,
        textColor: v1Styles.objectTextColor,
      },
    },

    contents: {
      margins: undefined,
      layout: undefined,
      gap: undefined,
    },
  };
}
