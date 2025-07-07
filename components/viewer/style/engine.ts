import Handlebars from 'handlebars';
import { join, map, mergeRight, multiply, pipe, prop } from 'ramda';

import type {
  ObjStyles,
  ProjectStyles,
  RowStyles,
} from '~/composables/project/types/v1';

export abstract class StyleGenerator<T> {
  abstract name: string;
  abstract gen(styling: T): string;
}

type TransformT<S, O> = (styles: S) => O;

type TransformR<S, TR extends Record<string, TransformT<S, any>>> = {
  [K in keyof TR]: ReturnType<TR[K]>;
};
const StyleUtils = {
  parseNumber: (input: string | number): number =>
    typeof input !== 'number' ? Number.parseFloat(input) : input,
  parseBorderRadius: (key: string) =>
    pipe(prop(key), StyleUtils.parseNumber, multiply(10)),

  applyTransforms: <
    S extends object,
    TR extends Record<string, TransformT<S, any>>,
  >(
    styles: S,
    transforms: TR,
  ) =>
    mergeRight(
      styles,
      map((value) => value(styles), transforms) as TransformR<S, TR>,
    ),
};

export function createStyles<T>(
  styling: T,
  generators: StyleGenerator<T>[],
): string {
  const styles = map((generator) => generator.gen(styling).trim(), generators);
  return join('\n', styles);
}

export class ProjectStylesGen extends StyleGenerator<ProjectStyles> {
  name = 'project';

  private readonly _template;
  constructor() {
    super();
    this._template = Handlebars.compile(ProjectStylesGen.TEMPLATE);
  }

  gen(styling: ProjectStyles): string {
    return this._template(styling);
  }

  static TEMPLATE: string = `
    .project {
      background-color: {{backgroundColor}};
    }
  `;
}

export class RowStylesGen extends StyleGenerator<RowStyles> {
  name = 'row';

  private readonly _template;
  private readonly _options;
  constructor(options: { container?: string; global?: boolean } = {}) {
    super();
    this._options = options;
    this._template = Handlebars.compile(RowStylesGen.TEMPLATE);
  }

  gen(styling: RowStyles): string {
    // Ugly Hack but the original format is cursed
    const computed = StyleUtils.applyTransforms(styling, {
      rowBorderRadiusUnit: (styling) =>
        styling.rowBorderRadiusIsPixels ? 'px' : '%',
      rowBorderRadiusTopLeft: StyleUtils.parseBorderRadius(
        'rowBorderRadiusTopLeft',
      ),
      rowBorderRadiusTopRight: StyleUtils.parseBorderRadius(
        'rowBorderRadiusTopRight',
      ),
      rowBorderRadiusBottomLeft: StyleUtils.parseBorderRadius(
        'rowBorderRadiusBottomLeft',
      ),
      rowBorderRadiusBottomRight: StyleUtils.parseBorderRadius(
        'rowBorderRadiusBottomRight',
      ),
    });

    const styles = this._template({
      ...computed,
      global: this._options.global,
    });
    if (this._options.container) {
      return `${this._options.container} { ${styles} }`;
    } else {
      return styles;
    }
  }

  static TEMPLATE: string = `
    .project-row{{#if global}}:not(.hasPrivateStyling){{/if}} {
      
      .row-title {
        font-family: {{rowTitle}};
        font-size: {{rowTitleTextSize}}%;
        text-align: {{rowTitleAlign}};
        color: {{rowTitleColor}};
      }
      .row-text {
        font-family: {{rowText}};
        text-align: {{rowTextAlign}};
        font-size: {{rowTextTextSize}}%;
        color: {{rowTextColor}};
        padding: {{rowTextPaddingX}}px {{rowTextPaddingY}}%;
      }
      .row-image {
        width: {{rowImageWidth}}%;
        margin-top: {{rowImageMarginTop}}%;
        margin-bottom: {{rowImageMarginBottom}}%;

        {{#if rowImgOverflowIsOn}}
        overflow: hidden;
        {{/if}}

        {{#if rowImgBorderIsOn}}
        border: {{rowImgBorderWidth}}px {{rowImgBorderStyle}} {{rowImgBorderColor}};
        {{else}}
        border: none;
        {{/if}}
      }
      .row-header {
        {{#if rowBgColorIsOn}}
        background-color: {{rowBgColor}};
        {{else}}
        background-color: transparent;
        {{/if}}
      
        margin-left: {{rowMargin}}%;
        margin-right: {{rowMargin}}%;
        
        {{#if rowBorderIsOn}}
        border: {{rowBorderWidth}}px {{rowBorderStyle}} {{rowBorderColor}};
        
        border-top-left-radius: {{rowBorderRadiusTopLeft}}{{rowBorderRadiusUnit}};
        border-top-right-radius: {{rowBorderRadiusTopRight}}{{rowBorderRadiusUnit}};
        border-bottom-left-radius: {{rowBorderRadiusBottomLeft}}{{rowBorderRadiusUnit}};
        border-bottom-right-radius: {{rowBorderRadiusBottomRight}}{{rowBorderRadiusUnit}};
        {{else}}
        border: none;
        {{/if}}
      }

      margin-top: {{rowBodyMarginTop}}px;
      margin-bottom: {{rowBodyMarginBottom}}px;
      margin-left: {{rowBodyMarginSides}}%;
      margin-right: {{rowBodyMarginSides}}%;

      {{#if rowOverFlowIsOn}}
      overflow: hidden;
      {{/if}}
    }
  `;
}

export class ObjStylesGen extends StyleGenerator<ObjStyles> {
  name = 'obj';

  private readonly _template;
  private readonly _options;
  constructor(options: { container?: string; global?: boolean } = {}) {
    super();
    this._options = options;
    this._template = Handlebars.compile(ObjStylesGen.TEMPLATE);
  }

  gen(styling: ObjStyles): string {
    // Ugly Hack but the original format is cursed
    const computed = StyleUtils.applyTransforms(styling, {
      objectBorderRadiusUnit: (styling) =>
        styling.objectBorderRadiusIsPixels ? 'px' : '%',
      objectBorderRadiusTopLeft: StyleUtils.parseBorderRadius(
        'objectBorderRadiusTopLeft',
      ),
      objectBorderRadiusTopRight: StyleUtils.parseBorderRadius(
        'objectBorderRadiusTopRight',
      ),
      objectBorderRadiusBottomLeft: StyleUtils.parseBorderRadius(
        'objectBorderRadiusBottomLeft',
      ),
      objectBorderRadiusBottomRight: StyleUtils.parseBorderRadius(
        'objectBorderRadiusBottomRight',
      ),
    });

    const styles = this._template({
      ...computed,
      global: this._options.global,
    });
    if (this._options.container) {
      return `${this._options.container} { ${styles} }`;
    } else {
      return styles;
    }
  }

  static TEMPLATE: string = `
    .project-obj{{#if global}}:not(.hasPrivateStyling){{/if}} {
      {{#if objectBgColorIsOn}}
      background-color: {{objectBgColor}};
      {{/if}}
      
      .obj-title {
        font-family: {{objectTitle}};
        font-size: {{objectTitleTextSize}}%;
        color: {{objectTitleColor}};
        text-align: {{objectTitleAlign}};
      }
      .obj-text {
        font-family: {{objectText}};
        text-align: {{objectTextAlign}};
        color: {{objectTextColor}};
        padding: max({{objectTextPadding}}px, 0.75rem);
        font-size: {{objectTextTextSize}}%;
      }
      .obj-image {
        width: {{objectImageWidth}}%;
        margin-top: {{objectImageMarginTop}}px;
        margin-bottom: {{objectImageMarginBottom}}px;

        {{#if objectImgObjectFillIsOn}}
        object-fit: {{objectImgObjectFillStyle}};
        {{#if objectImgObjectFillHeight}}
        height: {{objectImgObjectFillHeight}}px; /* this can be empty while objectImgObjectFillIsOn :) */
        {{/if}}
        {{/if}}
      }
      .addon {
        .text {
          font-family: {{addonText}};
          font-size: {{addonTextTextSize}}%;
          color: {{addonTextColor}};
          text-align: {{addonTextAlign}};
          padding: max({{objectTextPadding}}px, 0.75rem);
        }

        .title {
          font-family: {{addonTitle}};
          font-size: {{addonTitleTextSize}}%;
          color: {{addonTitleColor}};
          text-align: {{addonTitleAlign}};
        }
        
        &.disabled {
          {{#if reqBgColorIsOn}}
          background-color: {{reqFilterBgColor}};
          {{/if}}
          {{#if reqFilterGrayIsOn}}
          filter: grayscale({{reqFilterGray}}%);
          {{/if}}
        }
      }

      .obj-score, .obj-requirements {
        font-family: {{scoreText}};
        font-size: {{scoreTextSize}}%;
        text-align: {{scoreTextAlign}};
        color: {{scoreTextColor}};
      }

      /* FIXME: Disabled as it messes up parent columns, appears related to grid.css
      margin: {{objectMargin}}px;
      */

      {{#if objectBorderIsOn}}
      border-color: {{objectBorderColor}};
      border-style: {{objectBorderStyle}};
      border-width: {{objectBorderWidth}}px;
      
      border-top-left-radius: {{objectBorderRadiusTopLeft}}{{objectBorderRadiusUnit}};
      border-top-right-radius: {{objectBorderRadiusTopRight}}{{objectBorderRadiusUnit}};
      border-bottom-left-radius: {{objectBorderRadiusBottomLeft}}{{objectBorderRadiusUnit}};
      border-bottom-right-radius: {{objectBorderRadiusBottomRight}}{{objectBorderRadiusUnit}};
      {{else}}
      border: none;
      {{/if}}
      
      &.selected {
        {{#if selBgColorIsOn}}
        background-color: {{selFilterBgColor}};
        {{/if}}
        {{#if selFilterGrayIsOn}}
        filter: grayscale({{selFilterGray}}%);
        {{/if}}
      }
      &.disabled {
        {{#if reqBgColorIsOn}}
        background-color: {{reqFilterBgColor}};
        {{/if}}
        {{#if reqFilterGrayIsOn}}
        filter: grayscale({{reqFilterGray}}%);
        {{/if}}
      }
    }
  `;
}
