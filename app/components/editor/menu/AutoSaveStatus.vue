<template>
  <div class="flex flex-row items-center">
    <ProgressSpinner
      v-if="editorStore.status === 'loading'"
      style="width: 1.5rem; height: 1.5rem"
    />

    <div
      v-if="autoSaveUtils.isDirty"
      class="iconify solar--danger-circle-line-duotone size-5 text-yellow-500"
    ></div>
    <div
      v-else
      class="iconify solar--check-circle-line-duotone size-5 text-green-500"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useEditorAutoSave } from '~/composables/editor/useEditorAutoSave';
import { useEditorStore } from '~/composables/editor/useEditorStore';

const autoSaveUtils = useEditorAutoSave();
const editorStore = useEditorStore();
</script>

<style scoped lang="scss"></style>
