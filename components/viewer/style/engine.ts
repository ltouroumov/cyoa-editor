import Handlebars from 'handlebars';
import { join, map } from 'ramda';

import { ObjStyles, ProjectStyles, RowStyles } from '~/composables/project';

export abstract class StyleGenerator<T> {
  abstract name: string;
  abstract gen(styling: T): string;
}

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
      
      color: {{rowTextColor}};
      .row-title {
        color: {{rowTitleColor}};
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
    // Ugly Hack but the origina format is cursed
    const computed = {
      objectBorderRadiusUnit: styling.objectBorderRadiusIsPixels ? 'px' : '%',
      objectBorderRadiusTopLeft:
        Number.parseFloat(styling.objectBorderRadiusTopLeft) * 10,
      objectBorderRadiusTopRight:
        Number.parseFloat(styling.objectBorderRadiusTopRight) * 10,
      objectBorderRadiusBottomLeft:
        Number.parseFloat(styling.objectBorderRadiusBottomLeft) * 10,
      objectBorderRadiusBottomRight:
        Number.parseFloat(styling.objectBorderRadiusBottomRight) * 10,
    };
    return this._template({ ...styling, ...computed });
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
