import { describe, expect, it } from 'vitest';

import { resolveReqFilterVisible } from './reqFilterVisible';

import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import type {
  ObjStyles,
  ProjectStyles,
  RowStyles,
} from '~/composables/project/types/v1/styles';

const obj = (
  isPrivateStyling: boolean,
  reqFilterVisibleIsOn?: boolean,
): Pick<ProjectObj, 'isPrivateStyling' | 'styling'> => ({
  isPrivateStyling,
  styling: isPrivateStyling ? ({ reqFilterVisibleIsOn } as ObjStyles) : null,
});

const row = (
  isPrivateStyling: boolean,
  reqFilterVisibleIsOn?: boolean,
): Pick<ProjectRow, 'isPrivateStyling' | 'styling'> => ({
  isPrivateStyling,
  styling: isPrivateStyling
    ? ({ reqFilterVisibleIsOn } as RowStyles)
    : undefined,
});

const project = (reqFilterVisibleIsOn?: boolean): ProjectStyles =>
  ({ reqFilterVisibleIsOn }) as ProjectStyles;

describe('resolveReqFilterVisible', () => {
  it('is false when no styling level sets the flag', () => {
    expect(resolveReqFilterVisible(obj(false), row(false), project())).toBe(
      false,
    );
  });

  it('honours the project-level flag when neither row nor choice is private', () => {
    expect(resolveReqFilterVisible(obj(false), row(false), project(true))).toBe(
      true,
    );
  });

  it('uses the row private styling flag over the project flag', () => {
    expect(
      resolveReqFilterVisible(obj(false), row(true, true), project(false)),
    ).toBe(true);
  });

  it('row private styling with the flag off shadows the project flag', () => {
    expect(
      resolveReqFilterVisible(obj(false), row(true, false), project(true)),
    ).toBe(false);
  });

  it('uses the choice private styling flag over the row and project flags', () => {
    expect(
      resolveReqFilterVisible(
        obj(true, true),
        row(true, false),
        project(false),
      ),
    ).toBe(true);
  });

  it('choice private styling with the flag off shadows the row flag', () => {
    expect(
      resolveReqFilterVisible(obj(true, false), row(true, true), project(true)),
    ).toBe(false);
  });

  it('is false when the project styling is undefined', () => {
    expect(resolveReqFilterVisible(obj(false), row(false), undefined)).toBe(
      false,
    );
  });
});
