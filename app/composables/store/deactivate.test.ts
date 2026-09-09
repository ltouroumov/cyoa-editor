import { describe, expect, it } from 'vitest';

import { resolveDeactivateTargets } from './deactivate';

import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';

const obj = (id: string, groups: string[] = []): ProjectObj =>
  ({ id, groups: groups.map((g) => ({ id: g })) }) as ProjectObj;

const row = (
  id: string,
  objects: ProjectObj[],
  resultGroupId = '',
): ProjectRow => ({ id, resultGroupId, objects }) as ProjectRow;

const rows: ProjectRow[] = [
  row('r1', [obj('a', ['g1']), obj('b', ['g1', 'g2'])], 'rg1'),
  row('r2', [obj('c', ['g2']), obj('d')], 'rg2'),
  row('r3', [obj('e')]),
];

const groupIds = new Set(['g1', 'g2']);

describe('resolveDeactivateTargets', () => {
  it('returns a plain choice id untouched', () => {
    expect(resolveDeactivateTargets(rows, groupIds, ['e'])).toEqual(['e']);
  });

  it('expands a row resultGroupId to every choice in that row', () => {
    expect(resolveDeactivateTargets(rows, groupIds, ['rg1'])).toEqual([
      'rg1',
      'a',
      'b',
    ]);
  });

  it('expands a declared group id to every member choice', () => {
    expect(resolveDeactivateTargets(rows, groupIds, ['g2'])).toEqual([
      'g2',
      'b',
      'c',
    ]);
  });

  it('does not expand a group id the project does not declare', () => {
    expect(resolveDeactivateTargets(rows, groupIds, ['g9'])).toEqual(['g9']);
  });

  it('unions and de-duplicates across multiple tokens', () => {
    expect(
      resolveDeactivateTargets(rows, groupIds, ['g1', 'c', 'rg2']),
    ).toEqual(['g1', 'a', 'b', 'c', 'rg2', 'd']);
  });
});
