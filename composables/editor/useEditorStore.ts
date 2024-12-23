import { defineStore } from 'pinia';

import type { EditorProject } from '~/composables/shared/tables/projects';

export const useEditorStore = defineStore('editor', () => {
  const status = ref<'empty' | 'loading' | 'ready'>('empty');
  const project = ref<EditorProject | null>(null);

  return { status, project };
});
