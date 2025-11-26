import { clone, findIndex, propEq } from 'ramda';

import type { ChildObject } from '~/composables/project/types/v2/objects';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useProjectMoveUtils() {
  const projectStore = useProjectStore();

  function moveRelative(objectId: string, offset: number) {
    const parentId: string = projectStore.getParent(objectId)!;
    const childArr: ChildObject[] = clone(projectStore.children.get(parentId)!);

    const childIndex = findIndex(propEq(objectId, 'id'), childArr);
    if (childIndex > -1) {
      const targetIndex = childIndex + offset;
      // Guard against OOB moves
      if (targetIndex > childArr.length - 1 || targetIndex < 0) return;

      const moveArr = childArr.splice(childIndex, 1);
      childArr.splice(targetIndex, 0, ...moveArr);
      projectStore.children.set(parentId, childArr);
    }
  }

  function moveAbsolute(objectId: string, position: number) {
    const parentId: string = projectStore.getParent(objectId)!;
    const childArr: ChildObject[] = clone(projectStore.children.get(parentId)!);

    const childIndex = findIndex(propEq(objectId, 'id'), childArr);
    if (childIndex > -1) {
      const moveArr = childArr.splice(childIndex, 1);
      childArr.splice(position, 0, ...moveArr);
      projectStore.children.set(parentId, childArr);
    }
  }

  return {
    moveRelative,
    moveAbsolute,
  };
}
