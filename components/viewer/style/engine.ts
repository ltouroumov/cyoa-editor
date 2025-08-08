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

    return this._template({
      ...computed,
      global: this._options.global,
      container: this._options.container,
    });
  }

  static TEMPLATE: string = `
    {{#if global}}*:not(.hasPrivateStyling){{/if}}{{#if container}}{{container}}{{/if}} {
      --row-title-font: {{rowTitle}};
      --row-title-size: {{rowTitleTextSize}}%;
      --row-title-align: {{rowTitleAlign}};
      --row-title-color: {{rowTitleColor}};
      --row-text-font: {{rowText}};
      --row-text-align: {{rowTextAlign}};
      --row-text-size: {{rowTextTextSize}}%;
      --row-text-color: {{rowTextColor}};
      --row-text-padding-x: {{rowTextPaddingX}}px;
      --row-text-padding-y: {{rowTextPaddingY}}%;
      --row-image-width: {{rowImageWidth}}%;
      --row-image-margin-top: {{rowImageMarginTop}}%;
      --row-image-margin-bottom: {{rowImageMarginBottom}}%;
      --row-img-border: {{#if rowImgBorderIsOn}}{{rowImgBorderWidth}}px {{rowImgBorderStyle}} {{rowImgBorderColor}}{{else}}none{{/if}};
      --row-img-overflow: {{#if rowImgOverflowIsOn}}hidden{{else}}initial{{/if}};
      --row-bg-color: {{#if rowBgColorIsOn}}{{rowBgColor}}{{else}}transparent{{/if}};
      --row-margin: {{rowMargin}}%;
      --row-border: {{#if rowBorderIsOn}}{{rowBorderWidth}}px {{rowBorderStyle}} {{rowBorderColor}}{{else}}none{{/if}};
      --row-border-radius-top-left: {{rowBorderRadiusTopLeft}}{{rowBorderRadiusUnit}};
      --row-border-radius-top-right: {{rowBorderRadiusTopRight}}{{rowBorderRadiusUnit}};
      --row-border-radius-bottom-left: {{rowBorderRadiusBottomLeft}}{{rowBorderRadiusUnit}};
      --row-border-radius-bottom-right: {{rowBorderRadiusBottomRight}}{{rowBorderRadiusUnit}};
      --row-body-margin-top: {{rowBodyMarginTop}}px;
      --row-body-margin-bottom: {{rowBodyMarginBottom}}px;
      --row-body-margin-sides: {{rowBodyMarginSides}}%;
      --row-overflow: {{#if rowOverFlowIsOn}}hidden{{else}}initial{{/if}};
    }
    
    .project-row {
      .row-title {
        font-family: var(--row-title-font);
        font-size: var(--row-title-size);
        text-align: var(--row-title-align); 
        color: var(--row-title-color);
      }
      .row-text {
        font-family: var(--row-text-font);
        text-align: var(--row-text-align);
        font-size: var(--row-text-size);
        color: var(--row-text-color);
        padding: var(--row-text-padding-x) var(--row-text-padding-y);
      }
      .row-image {
        width: var(--row-image-width);
        margin-top: var(--row-image-margin-top);
        margin-bottom: var(--row-image-margin-bottom);

        overflow: var(--row-img-overflow);
        border: var(--row-img-border);
      }
      .row-header {
        background-color: var(--row-bg-color);
        margin-left: var(--row-margin);
        margin-right: var(--row-margin);
        border: var(--row-border);
        
        border-top-left-radius: var(--row-border-radius-top-left);
        border-top-right-radius: var(--row-border-radius-top-right);
        border-bottom-left-radius: var(--row-border-radius-bottom-left);
        border-bottom-right-radius: var(--row-border-radius-bottom-right);
      }

      margin-top: var(--row-body-margin-top);
      margin-bottom: var(--row-body-margin-bottom);
      margin-left: var(--row-body-margin-sides);
      margin-right: var(--row-body-margin-sides);

      overflow: var(--row-overflow);
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

    return this._template({
      ...computed,
      global: this._options.global,
      container: this._options.container,
    });
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
