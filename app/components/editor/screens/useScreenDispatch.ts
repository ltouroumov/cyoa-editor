import type { MenuItem } from 'primevue/menuitem';
import { has, isEmpty, isNil, last } from 'ramda';

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
  () => import('~/components/editor/screens/styles/EditStyleScreen.vue'),
);
const ScoresScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/content/scores/ScoresScreen.vue'),
);
const EditScoreScreen = defineAsyncComponent(
  () =>
    import('~/components/editor/screens/content/scores/EditScoreScreen.vue'),
);

export function buildStackFromObjectId(objectId: string, hint?: string): any[] {
  const projectStore = useProjectStore();
  const stack = [];

  if (
    (hint === 'object' || isNil(hint)) &&
    projectStore.objects.has(objectId)
  ) {
    const parents = projectStore.getParents(objectId);
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
  } else if (
    (hint === 'score' || isNil(hint)) &&
    projectStore.scores.has(objectId)
  ) {
    stack.push({
      type: 'edit-score',
      scoreId: objectId,
    });
  } else if (
    (hint === 'style' || isNil(hint)) &&
    has(objectId, projectStore.styles.rules)
  ) {
    stack.push({
      type: 'edit-style',
      styleId: objectId,
    });
  } else if (
    (hint === 'media' || isNil(hint)) &&
    has(objectId, projectStore.media.images)
  ) {
    // TODO: edit media
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

  function dispatchScoreScreen(top: any): ScreenComponent {
    switch (top.type) {
      case 'edit-score':
        return { component: EditScoreScreen, props: { scoreId: top.scoreId } };
      default:
        return { component: BlankScreen, props: {} };
    }
  }

  function dispatchStyleScreen(top: any): ScreenComponent {
    switch (top.type) {
      case 'edit-style':
        return { component: StyleEditScreen, props: { styleId: top.styleId } };
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
      case 'scores':
        return { component: ScoresScreen };
      case 'media':
        return { component: MediaScreen };
      case 'styles':
        if (isEmpty(editorStore.stack)) {
          return { component: StylesScreen };
        } else {
          const top = last(editorStore.stack);
          return dispatchStyleScreen(top);
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
      case 'scores':
        return {
          root: true,
          label: 'Scores',
          icon: 'iconify solar--card-2-line-duotone',
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
        case 'edit-score': {
          const score = projectStore.scores.get(item.scoreId);
          return {
            label: score?.title || score?.id,
            icon: 'iconify solar--card-2-line-duotone',
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
