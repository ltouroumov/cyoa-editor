import { watchDebounced } from '@vueuse/core';
import { isEmpty, last } from 'ramda';

import { buildStackFromObjectId } from '~/components/editor/screens/useScreenDispatch';
import { useEditorStore } from '~/composables/editor/useEditorStore';

type HashState = {
  projectId?: number;
  root?: string;
  screen?: string;
};

function parseHash(): HashState {
  if (!window.location.hash) return {};

  const hash = window.location.hash.slice(1); // Remove '#'
  const params = new URLSearchParams(hash);

  const state: HashState = {};

  const projectId = params.get('projectId');
  if (projectId) state.projectId = parseInt(projectId, 10);

  const root = params.get('root');
  if (root) state.root = root;

  const screen = params.get('screen');
  if (screen) state.screen = screen;

  return state;
}

function buildHash(state: HashState): string {
  const params = new URLSearchParams();

  if (state.projectId !== undefined) {
    params.set('projectId', state.projectId.toString());
  }
  if (state.root) {
    params.set('root', state.root);
  }
  if (state.screen) {
    params.set('screen', state.screen);
  }

  return params.toString() ? `#${params.toString()}` : '';
}

function serializeScreen(screen: any): string {
  switch (screen.type) {
    case 'edit-page':
      return `page:${screen.pageId}`;
    case 'edit-row':
      return `row:${screen.rowId}`;
    case 'edit-choice':
      return `choice:${screen.choiceId}`;
    case 'edit-addon':
      return `addon:${screen.addonId}`;
    case 'edit-style':
      return `style:${screen.styleId}`;
    default:
      return '';
  }
}

function deserializeScreen(screenStr: string): { objectId: string } | null {
  if (!screenStr) return null;

  const [_type, objectId] = screenStr.split(':');
  if (!objectId) return null;

  return { objectId };
}

export function useEditorRouting() {
  const editorStore = useEditorStore();

  // Sync state to URL hash
  function syncToHash() {
    if (editorStore.mode !== 'editor' || !editorStore.project) {
      // Clear hash when not in editor mode or no project
      if (window.location.hash) {
        window.location.hash = '';
      }
      return;
    }

    const state: HashState = {
      projectId: editorStore.project.id,
      root: editorStore.root,
    };

    // Serialize only the last screen in stack
    if (!isEmpty(editorStore.stack)) {
      const lastScreen = last(editorStore.stack);
      state.screen = serializeScreen(lastScreen);
    }

    const hash = buildHash(state);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }

  // Restore state from URL hash
  function restoreFromHash(): HashState {
    return parseHash();
  }

  // Restore navigation stack from hash
  function restoreStack(hashState: HashState) {
    if (!hashState.screen) {
      editorStore.stack = [];
      return;
    }

    const screen = deserializeScreen(hashState.screen);
    if (!screen) {
      editorStore.stack = [];
      return;
    }

    // Rebuild full stack from object ID
    const stack = buildStackFromObjectId(screen.objectId);
    editorStore.stack = stack;
  }

  // Watch for changes and sync to hash (debounced to avoid excessive updates)
  watchDebounced(
    [
      () => editorStore.mode,
      () => editorStore.project?.id,
      () => editorStore.root,
      () => editorStore.stack,
    ],
    syncToHash,
    { debounce: 300, maxWait: 1000 },
  );

  return {
    restoreFromHash,
    restoreStack,
  };
}
