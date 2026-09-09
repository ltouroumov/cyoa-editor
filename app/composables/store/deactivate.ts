import * as R from 'ramda';

import type { ProjectRow } from '~/composables/project/types/v1';

/**
 * Expand the comma-separated tokens of a choice's `deactivateThisChoice` into
 * the concrete set of object ids to deselect.
 *
 * Mirrors the legacy iCYOA viewer: each token matches on any of
 *  - a choice id (the token itself),
 *  - a row `resultGroupId` (deselects every choice in that row),
 *  - a group id, but only when the project declares that group
 *    (deselects every choice that is a member of the group).
 */
export const resolveDeactivateTargets = (
  rows: ProjectRow[],
  groupIds: ReadonlySet<string>,
  tokens: string[],
): string[] => {
  const resolveToken = (token: string): string[] => {
    const ids: string[] = [token];

    for (const row of rows) {
      if (row.resultGroupId && row.resultGroupId === token) {
        for (const obj of row.objects) ids.push(obj.id);
      }

      if (groupIds.has(token)) {
        for (const obj of row.objects) {
          if (R.any((g) => g.id === token, obj.groups ?? [])) {
            ids.push(obj.id);
          }
        }
      }
    }

    return ids;
  };

  return R.uniq(R.chain(resolveToken, tokens));
};
