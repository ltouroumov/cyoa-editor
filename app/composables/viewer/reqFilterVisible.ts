import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import type { ProjectStyles } from '~/composables/project/types/v1/styles';

/**
 * Legacy `reqFilterVisibleIsOn` ("Hide The Choice Completely"): when a choice
 * fails its requirements it is removed from the row entirely instead of being
 * shown with the blocked filter.
 *
 * The flag lives in the styling block, so it resolves through the same
 * choice → row → project cascade the style engine applies (`StyleObj` /
 * `StyleRow` containers override the global `:not(.hasPrivateStyling)` rules).
 *
 * @returns true when a blocked choice should be hidden outright
 */
export const resolveReqFilterVisible = (
  obj: Pick<ProjectObj, 'isPrivateStyling' | 'styling'>,
  row: Pick<ProjectRow, 'isPrivateStyling' | 'styling'>,
  projectStyling: Pick<ProjectStyles, 'reqFilterVisibleIsOn'> | undefined,
): boolean => {
  if (obj.isPrivateStyling) return obj.styling?.reqFilterVisibleIsOn === true;
  if (row.isPrivateStyling) return row.styling?.reqFilterVisibleIsOn === true;
  return projectStyling?.reqFilterVisibleIsOn === true;
};
