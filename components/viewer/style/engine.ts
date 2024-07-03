import Handlebars from 'handlebars';
import { join, map, mergeRight, multiply, pipe, prop } from 'ramda';

import { ObjStyles, ProjectStyles, RowStyles } from '~/composables/project';

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
  console.log('Generated Styles', styles);
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
  constructor() {
    super();
    this._template = Handlebars.compile(RowStylesGen.TEMPLATE);
  }

  gen(styling: ObjStyles): string {
    return this._template(styling);
  }

  static TEMPLATE: string = `
    .project-row {
      {{#if rowBgColorIsOn}}
      background-color: {{rowBgColor}};
      {{/if}}
      
      font-family: {{rowText}};
      color: {{rowTextColor}};
      .row-title {
        font-family: {{rowTitle}};
        font-size: {{rowTitleTextSize}}%;
        text-align: {{rowTitleAlign}};
        color: {{rowTitleColor}};
      }
      .row-text {
        font-size: {{rowTextTextSize}}%;
        text-align: {{rowTextAlign}};
        padding: {{rowTextPaddingX}}px {{rowTextPaddingY}}px;
      }
    }
  `;
}

export class ObjStylesGen extends StyleGenerator<ObjStyles> {
  name = 'obj';

  private readonly _template;
  constructor() {
    super();
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
    return this._template(computed);
  }

  static TEMPLATE: string = `
    .project-obj {
      {{#if objectBgColorIsOn}}
      background-color: {{objectBgColor}};
      {{/if}}
      
      color: {{objectTextColor}};
      .object-title {
        color: {{objectTitleColor}};
      }
      
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
      
      {{#if objectHeight}}
      d-flex;
      height: 100%;
      {{/if}}
      
      {{#if selBgColorIsOn}}
      &.selected {
        background-color: {{selFilterBgColor}}
      }
      {{/if}}
      {{#if reqBgColorIsOn}}
      &.disabled {
        background-color: {{reqFilterBgColor}}
      }
      {{/if}}
    }
  `;
}
