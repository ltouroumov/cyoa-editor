import { defineStore } from 'pinia';
import { append, dropLast, take } from 'ramda';

import type {
  EditorProject,
  EditorProjectVersion,
} from '~/composables/shared/tables/projects';

type EditorStatus = 'empty' | 'loading' | 'ready';

export const useEditorStore = defineStore('editor', () => {
  const status = ref<EditorStatus>('empty');
  const project = ref<EditorProject | null>(null);
  const version = ref<EditorProjectVersion | null>(null);

  const mode = ref<'library' | 'editor'>('library');
  const root = ref<'content' | 'styles'>('content');
  const stack = ref<any[]>([]);

  function pushScreen(screen: any) {
    stack.value = append(screen, stack.value);
  }

  function clearStack() {
    stack.value = [];
  }

  function popStack(index?: number) {
    const _stack = stack.value;
    console.log(`popStack(${index})`, _stack.length);
    if (index) {
      if (_stack.length === index + 1) {
        return;
      } else {
        stack.value = take(index + 1, _stack);
      }
    } else {
      stack.value = dropLast(1, _stack);
    }
  }

  async function withLoadingState<T>(work: () => Promise<T>): Promise<T> {
    status.value = 'loading';
    await nextTick();

    try {
      return await work();
    } finally {
      status.value = 'ready';
    }
  }

  return {
    // Data
    status,
    project,
    version,
    mode,
    root,
    stack,
    // Functions
    pushScreen,
    clearStack,
    popStack,
    withLoadingState,
  };
});
