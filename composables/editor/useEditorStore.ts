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

  return {
    // Data
    status,
    project,
    mode,
    stack,
    // Functions
    pushScreen,
  };
});
