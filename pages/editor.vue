<template>
  <LazyProjectLibrary v-if="editorStore.mode == 'library'" />
  <LazyProjectEditor v-if="editorStore.mode === 'editor'" />
  <DynamicDialog />
</template>

<script setup lang="ts">
import { useEditorStore } from '~/composables/editor/useEditorStore';

const editorStore = useEditorStore();
</script>

<style>
@import '~/assets/css/bootstrap/grid.scss';

body {
  background: var(--p-stone-700);
  height: 100vh;
}
</style>
