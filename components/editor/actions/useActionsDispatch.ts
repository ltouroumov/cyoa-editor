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
            icon: 'iconify solar--list-line-duotone',
          },
        ];
      default:
        return [];
    }
  }

  const actions = computed((): ActionItem[] => {
    switch (editorStore.mode) {
      case 'content':
        if (isEmpty(editorStore.stack)) {
          return [
            {
              label: 'New Page',
              icon: 'iconify solar--add-circle-line-duotone',
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
