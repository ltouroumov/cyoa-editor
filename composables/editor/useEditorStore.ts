import { defineStore } from 'pinia';
import { append } from 'ramda';

import type { EditorProject } from '~/composables/shared/tables/projects';

export const useEditorStore = defineStore('editor', () => {
  const status = ref<'empty' | 'loading' | 'ready'>('empty');
  const project = ref<EditorProject | null>(null);

  const mode = ref<'content' | 'styles'>('content');
  const stack = ref<any[]>([]);

  function pushScreen(screen: any) {
    stack.value = append(screen, stack.value);
  }

  function clearStack() {
    stack.value = [];
  }

  function popStack(index?: number) {
    if (index) {
      stack.value = stack.value.slice(0, index);
    } else {
      stack.value = stack.value.slice(0, -2);
    }
  }

  return {
    // Data
    status,
    project,
    mode,
    stack,
    // Functions
    pushScreen,
    clearStack,
    popStack,
  };
});
