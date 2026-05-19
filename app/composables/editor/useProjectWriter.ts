import { reject } from 'ramda';
import { match } from 'ts-pattern';

import { useEditorStore } from '~/composables/editor/useEditorStore';
import { createId } from '~/composables/project/types/v2/id';
import type {
  AddonObject,
  ChoiceObject,
  PageObject,
  RowObject,
} from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useProjectWriter() {
  const editorStore = useEditorStore();
  const projectStore = useProjectStore();

  function addObject(type: ObjectType, parentId: string) {
    const objectId = createId(type);
    match(type)
      .with(ObjectType.page, () => {
        projectStore.objects.set(objectId, {
          id: objectId,
          type,
          name: 'New Page',
        } as PageObject);
        addChild(parentId, objectId);
      })
      .with(ObjectType.row, () => {
        projectStore.objects.set(objectId, {
          id: objectId,
          type,
          name: 'New Row',
          layout: {
            itemAlign: 'left',
            itemWidth: 4,
          },
          requirements: {},
        } as RowObject);
        addChild(parentId, objectId);
      })
      .with(ObjectType.choice, () => {
        projectStore.objects.set(objectId, {
          id: objectId,
          type,
          name: 'New Choice',
          header: {},
          components: {},
        } as ChoiceObject);
        addChild(parentId, objectId);
      })
      .with(ObjectType.addon, () => {
        projectStore.objects.set(objectId, {
          id: objectId,
          type,
          name: 'New Addon',
          header: {},
          components: {},
        } as AddonObject);
        addChild(parentId, objectId);
      })
      .exhaustive();

    projectStore.markDirty();
  }

  function addChild(parentId: string, childId: string) {
    const childObjects = projectStore.children.get(parentId) ?? [];
    childObjects.push({ id: childId });
    projectStore.markDirty();
  }

  function removeObject(objectId: string) {
    projectStore.objects.delete(objectId);
    removeChild(objectId);
    projectStore.markDirty();
  }

  function removeChild(childId: string) {
    const parentId = projectStore.getParent(childId);
    if (parentId) {
      const childObjects = projectStore.children.get(parentId);
      projectStore.children.set(
        parentId,
        reject((child) => child.id === childId, childObjects ?? []),
      );
    }
    projectStore.markDirty();
  }

  return { addObject, addChild, removeObject, removeChild };
}
