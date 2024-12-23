<template>
  <div
    v-if="editorStore.status !== 'ready'"
    class="flex flex-col justify-stretch items-center py-5 h-[100%]"
  >
    <ProjectLibrary class="grow w-[80%]" />
  </div>
  <LazyProjectEditor v-if="editorStore.status === 'ready'" />
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
  width: 100vw;
  height: 100vh;
}
</style>
