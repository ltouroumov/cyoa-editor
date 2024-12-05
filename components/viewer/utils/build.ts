import { chain, groupBy, head, map, prop, toPairs } from 'ramda';

import type {
  SavedBuildGroup,
  SavedBuildItem,
  SavedBuildProject,
} from '~/composables/shared/tables/builds';
import type { Selections } from '~/composables/store/project';

export const getProjectInfo = (store: ProjectStore): SavedBuildProject => {
  if (store.status === 'loaded') {
    return {
      projectId: store.file.projectId,
      name: store.file.projectName,
      hash: store.file.projectHash,
    };
  } else {
    throw new Error('No project loaded');
  }
};

export const getSelectedItems = (
  selected: Selections,
  backpack: ProjectRow[],
  getObject: (id: string) => ProjectObj,
  getObjectRow: (id: string) => string,
  getRow: (id: string) => ProjectRow,
): SavedBuildGroup[] => {
  const selectedChoices = map(
    ([id, count]): SavedBuildItem & { groupId: string } => {
      const obj: ProjectObj = getObject(id);
      const row: ProjectRow = getRow(getObjectRow(id));
      return {
        objId: obj.id,
        title: obj.title,
        count,
        groupId: head(obj.groups)?.id ?? row.resultGroupId,
      };
    },
    toPairs(selected),
  );

  const choicesByGroup: Partial<Record<string, SavedBuildItem[]>> = groupBy(
    prop('groupId'),
    selectedChoices,
  );

  return chain((row: ProjectRow): SavedBuildGroup[] => {
    if (row.resultGroupId in choicesByGroup) {
      return [
        {
          rowId: row.id,
          title: row.title,
          items: choicesByGroup[row.resultGroupId] ?? [],
        },
      ];
    } else {
      return [];
    }
  }, backpack);
};
