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
      --row-border-radius: {{rowBorderRadiusTopLeft}}{{rowBorderRadiusUnit}} {{rowBorderRadiusTopRight}}{{rowBorderRadiusUnit}} {{rowBorderRadiusBottomRight}}{{rowBorderRadiusUnit}} {{rowBorderRadiusBottomLeft}}{{rowBorderRadiusUnit}};
      --row-body-margin: {{rowBodyMarginTop}}px {{rowBodyMarginSides}}% {{rowBodyMarginBottom}}px {{rowBodyMarginSides}}%;
      --row-overflow: {{#if rowOverFlowIsOn}}hidden{{else}}initial{{/if}};
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
    {{#if global}}*:not(.hasPrivateStyling){{/if}}{{#if container}}{{container}}{{/if}} {
      --obj-title-font: {{objectTitle}};
      --obj-title-size: {{objectTitleTextSize}}%;
      --obj-title-align: {{objectTitleAlign}};
      --obj-title-color: {{objectTitleColor}};
      --obj-text-font: {{objectText}};
      --obj-text-align: {{objectTextAlign}};
      --obj-text-size: {{objectTextTextSize}}%;
      --obj-text-color: {{objectTextColor}};
      --obj-text-padding: max({{objectTextPadding}}px, 0.75rem);
      --obj-image-width: {{objectImageWidth}}%;
      --obj-image-margin-top: {{objectImageMarginTop}}px;
      --obj-image-margin-bottom: {{objectImageMarginBottom}}px;
      --obj-img-object-fit: {{#if objectImgObjectFillIsOn}}{{objectImgObjectFillStyle}}{{else}}initial{{/if}};
      --obj-img-object-height: {{#if objectImgObjectFillHeight}}{{objectImgObjectFillHeight}}px{{else}}auto{{/if}};
      --obj-addon-text-font: {{addonText}};
      --obj-addon-text-size: {{addonTextTextSize}}%;
      --obj-addon-text-color: {{addonTextColor}};
      --obj-addon-text-align: {{addonTextAlign}};
      --obj-addon-title-font: {{addonTitle}};
      --obj-addon-title-size: {{addonTitleTextSize}}%;
      --obj-addon-title-color: {{addonTitleColor}};
      --obj-addon-title-align: {{addonTitleAlign}};
      --obj-score-font: {{scoreText}};
      --obj-score-size: {{scoreTextSize}}%;
      --obj-score-align: {{scoreTextAlign}};
      --obj-score-color: {{scoreTextColor}};
      --obj-bg-color: {{#if objectBgColorIsOn}}{{objectBgColor}}{{else}}initial{{/if}};
      --obj-margin: {{objectMargin}}px; /* Not used, see comment below */
      --obj-border: {{#if objectBorderIsOn}}{{objectBorderWidth}}px {{objectBorderStyle}} {{objectBorderColor}}{{else}}none{{/if}};
      --obj-border-radius: {{objectBorderRadiusTopLeft}}{{objectBorderRadiusUnit}} {{objectBorderRadiusTopRight}}{{objectBorderRadiusUnit}} {{objectBorderRadiusBottomRight}}{{objectBorderRadiusUnit}} {{objectBorderRadiusBottomLeft}}{{objectBorderRadiusUnit}};
      --obj-selected-bg-color: {{#if selBgColorIsOn}}{{selFilterBgColor}}{{else}}initial{{/if}};
      --obj-selected-filter: {{#if selFilterGrayIsOn}}grayscale({{selFilterGray}}%){{else}}none{{/if}};
      --obj-disabled-bg-color: {{#if reqBgColorIsOn}}{{reqFilterBgColor}}{{else}}initial{{/if}};
      --obj-disabled-filter: {{#if reqFilterGrayIsOn}}grayscale({{reqFilterGray}}%){{else}}none{{/if}};
      --obj-addon-disabled-bg-color: {{#if reqBgColorIsOn}}{{reqFilterBgColor}}{{else}}initial{{/if}};
      --obj-addon-disabled-filter: {{#if reqFilterGrayIsOn}}grayscale({{reqFilterGray}}%){{else}}none{{/if}};
    }
  `;
}
