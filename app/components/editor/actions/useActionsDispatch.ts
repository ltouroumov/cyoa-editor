import { isEmpty, last } from 'ramda';

import { useEditorStore } from '~/composables/editor/useEditorStore';
import { useProjectWriter } from '~/composables/editor/useProjectWriter';
import { ObjectType } from '~/composables/project/types/v2/objects/base';

type ActionItem = {
  label?: string;
  icon?: string;
  severity?: string;
  command?: () => void;
};

export function useActionsDispatch() {
  const editorStore = useEditorStore();
  const projectWriter = useProjectWriter();

  function dispatchContentScreen(top: any): ActionItem[] {
    switch (top.type) {
      case 'edit-page':
        return [
          {
            label: 'New Row',
            icon: 'iconify solar--add-circle-line-duotone',
            severity: 'secondary',
            command: () => {
              projectWriter.addObject(ObjectType.row, top.pageId);
            },
          },
        ];
      case 'edit-row':
        return [
          {
            label: 'New Choice',
            icon: 'iconify solar--add-circle-line-duotone',
            severity: 'secondary',
            command: () => {
              projectWriter.addObject(ObjectType.choice, top.rowId);
            },
          },
        ];
      case 'edit-choice':
        return [
          {
            label: 'New Addon',
            icon: 'iconify solar--add-circle-line-duotone',
            severity: 'secondary',
            command: () => {
              projectWriter.addObject(ObjectType.addon, top.choiceId);
            },
          },
        ];
      default:
        return [];
    }
  }

  const actions = computed((): ActionItem[] => {
    switch (editorStore.root) {
      case 'content':
        if (isEmpty(editorStore.stack)) {
          return [
            {
              label: 'New Page',
              icon: 'iconify solar--add-circle-line-duotone',
              severity: 'secondary',
              command: () => {
                projectWriter.addObject(ObjectType.page, '@root');
              },
            },
          ];
        } else {
          const top = last(editorStore.stack);
          return dispatchContentScreen(top);
        }
      default:
        return [];
    }
  });

  return { actions };
}
