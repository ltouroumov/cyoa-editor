import { isEmpty, last } from 'ramda';

import BlankScreen from '~/components/editor/screens/BlankScreen.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';

type ScreenComponent = { component: any; props?: any };

const ContentRoot = defineAsyncComponent(
  () => import('~/components/editor/screens/content/ContentRoot.vue'),
);
const ContentPage = defineAsyncComponent(
  () => import('~/components/editor/screens/content/ContentPage.vue'),
);

export function useScreenDispatch() {
  const editorStore = useEditorStore();

  function dispatchContentScreen(top: any): ScreenComponent {
    switch (top.type) {
      case 'edit-page':
        return { component: ContentPage, props: { pageId: top.pageId } };
      default:
        return { component: BlankScreen, props: {} };
    }
  }

  const screen = computed((): ScreenComponent => {
    switch (editorStore.mode) {
      case 'content':
        if (isEmpty(editorStore.stack)) {
          return { component: ContentRoot };
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
