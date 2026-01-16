<template>
  <LazyProjectLibrary v-if="editorStore.mode == 'library'" />
  <LazyProjectEditor v-if="editorStore.mode === 'editor'" />
  <DynamicDialog />
</template>

<script setup lang="ts">
import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';
import { useEditorRouting } from '~/composables/editor/useEditorRouting';
import { useEditorStore } from '~/composables/editor/useEditorStore';

const editorStore = useEditorStore();
const { initializeFromHash } = useEditorLibrary();

// Initialize hash-based routing
useEditorRouting();

// Initialize from hash on mount
onMounted(() => {
  initializeFromHash();
});
</script>

<style>
body {
  background: var(--p-stone-700);
  height: 100vh;
}
</style>
