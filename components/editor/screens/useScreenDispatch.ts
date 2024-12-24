import type { MenuItem } from 'primevue/menuitem';
import { isEmpty, last } from 'ramda';

import BlankScreen from '~/components/editor/screens/BlankScreen.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';
import { mapWithIndex } from '~/composables/utils/mapWithIndex';

type ScreenComponent = { component: any; props?: any };

const ContentScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/content/ContentScreen.vue'),
);
const PageScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/content/PageScreen.vue'),
);
const RowScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/content/RowScreen.vue'),
);

export function useScreenDispatch() {
  const editorStore = useEditorStore();
  const projectStore = useProjectStore();

  function dispatchContentScreen(top: any): ScreenComponent {
    switch (top.type) {
      case 'edit-page':
        return { component: PageScreen, props: { pageId: top.pageId } };
      case 'edit-row':
        return { component: RowScreen, props: { rowId: top.rowId } };
      default:
        return { component: BlankScreen, props: {} };
    }
  }

  const screen = computed((): ScreenComponent => {
    switch (editorStore.root) {
      case 'content':
        if (isEmpty(editorStore.stack)) {
          return { component: ContentScreen };
        } else {
          const top = last(editorStore.stack);
          return dispatchContentScreen(top);
        }
      default:
        return { component: BlankScreen, props: {} };
    }
  });

  const bcHome = computed((): MenuItem => {
    return {
      root: true,
      label: 'Pages',
      icon: 'iconify solar--documents-line-duotone',
      command: () => editorStore.clearStack(),
    };
  });

  const bcStack = computed<MenuItem[]>(() => {
    return mapWithIndex((item: any, index: number) => {
      switch (item.type) {
        case 'edit-page': {
          const page = projectStore.get(item.pageId, ObjectType.page)!;
          return {
            label: page.name,
            icon: 'iconify solar--document-text-line-duotone',
            command: () => editorStore.popStack(index),
          };
        }
        case 'edit-row': {
          const row = projectStore.get(item.rowId, ObjectType.row)!;
          return {
            label: row.name,
            icon: 'iconify solar--list-line-duotone',
            command: () => editorStore.popStack(index),
          };
        }
        default:
          return {
            label: '???',
          };
      }
    }, editorStore.stack ?? []);
  });

  return { screen, bcHome, bcStack };
}
