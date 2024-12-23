import { isEmpty, last } from 'ramda';

import BlankScreen from '~/components/editor/screens/BlankScreen.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';

type ScreenComponent = { component: any; props?: any };

const ContentScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/content/ContentScreen.vue'),
);
const PageScreen = defineAsyncComponent(
  () => import('~/components/editor/screens/content/PageScreen.vue'),
);

export function useScreenDispatch() {
  const editorStore = useEditorStore();

  function dispatchContentScreen(top: any): ScreenComponent {
    switch (top.type) {
      case 'edit-page':
        return { component: PageScreen, props: { pageId: top.pageId } };
      default:
        return { component: BlankScreen, props: {} };
    }
  }

  const screen = computed((): ScreenComponent => {
    switch (editorStore.mode) {
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

  return { screen };
}
