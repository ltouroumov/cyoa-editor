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
const ChoiceScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/content/ChoiceScreen.vue'),
);
const MediaScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/media/MediaScreen.vue'),
);
const StylesScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/styles/StylesScreen.vue'),
);
const StyleEditScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/styles/StyleEditScreen.vue'),
);

export function buildStackFromObjectId(objectId: string): any[] {
  const projectStore = useProjectStore();
  const parents = projectStore.getParents(objectId);
  const stack = [];

  for (const parentId of parents) {
    const object = projectStore.objects.get(parentId)!;
    switch (object.type) {
      case ObjectType.page:
        stack.push({
          type: 'edit-page',
          pageId: object.id,
        });
        break;
      case ObjectType.row:
        stack.push({
          type: 'edit-row',
          rowId: object.id,
        });
        break;
      case ObjectType.choice:
        stack.push({
          type: 'edit-choice',
          choiceId: object.id,
        });
        break;
      case ObjectType.addon:
        stack.push({
          type: 'edit-addon',
          addonId: object.id,
        });
        break;
    }
  }

  return stack;
}

export function useScreenDispatch() {
  const editorStore = useEditorStore();
  const projectStore = useProjectStore();

  function dispatchContentScreen(top: any): ScreenComponent {
    switch (top.type) {
      case 'edit-page':
        return { component: PageScreen, props: { pageId: top.pageId } };
      case 'edit-row':
        return { component: RowScreen, props: { rowId: top.rowId } };
      case 'edit-choice':
        return { component: ChoiceScreen, props: { choiceId: top.choiceId } };
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
      case 'media':
        return { component: MediaScreen };
      case 'styles':
        if (isEmpty(editorStore.stack)) {
          return { component: StylesScreen };
        } else {
          const top = last(editorStore.stack);
          if (top.type === 'edit-style') {
            return { component: StyleEditScreen, props: { styleId: top.styleId } };
          }
          return { component: BlankScreen, props: {} };
        }
      default:
        return { component: BlankScreen, props: {} };
    }
  });

  const bcHome = computed((): MenuItem => {
    switch (editorStore.root) {
      case 'content':
        return {
          root: true,
          label: 'Pages',
          icon: 'iconify solar--documents-line-duotone',
          command: () => editorStore.clearStack(),
        };
      case 'media':
        return {
          root: true,
          label: 'Media',
          icon: 'iconify solar--gallery-line-duotone',
          command: () => editorStore.clearStack(),
        };
      case 'styles':
        return {
          root: true,
          label: 'Styles',
          icon: 'iconify solar--pallete-2-line-duotone',
          command: () => editorStore.clearStack(),
        };
      default:
        return {
          root: true,
          label: 'Unknown',
          icon: 'iconify solar--question-circle-line-duotone',
          command: () => editorStore.clearStack(),
        };
    }
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
        case 'edit-choice': {
          const choice = projectStore.get(item.choiceId, ObjectType.choice)!;
          return {
            label: choice.name,
            icon: 'iconify solar--box-minimalistic-line-duotone',
            command: () => editorStore.popStack(index),
          };
        }
        case 'edit-style': {
          const style = projectStore.styles.rules[item.styleId];
          return {
            label: style.name || style.id,
            icon: 'iconify solar--pallete-2-line-duotone',
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
