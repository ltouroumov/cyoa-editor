import { isEmpty, last } from 'ramda';

import { useEditorStore } from '~/composables/editor/useEditorStore';

type ActionItem = {
  label?: string;
  icon?: string;
  severity?: string;
};

export function useActionsDispatch() {
  const editorStore = useEditorStore();

  function dispatchContentScreen(top: any): ActionItem[] {
    switch (top.type) {
      case 'edit-page':
        return [
          {
            label: 'New Row',
            icon: 'iconify solar--add-circle-line-duotone',
            severity: 'secondary',
          },
        ];
      case 'edit-row':
        return [
          {
            label: 'New Choice',
            icon: 'iconify solar--add-circle-line-duotone',
            severity: 'secondary',
          },
        ];
      case 'edit-choice':
        return [
          {
            label: 'New Addon',
            icon: 'iconify solar--add-circle-line-duotone',
            severity: 'secondary',
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
