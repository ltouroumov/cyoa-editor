<template>
  <div class="flex flex-row items-center ps-2">
    <Button
      variant="text"
      severity="secondary"
      label="Back"
      icon="iconify solar--alt-arrow-left-line-duotone"
      :disabled="bcStack.length === 0"
      @click="popScreen()"
    />
    <div class="h-1/2 mx-2 border-l border-surface-700"></div>
    <Breadcrumb :home="bcHome" :model="bcStack" :dt="{ background: 'none' }" />
  </div>
</template>

<script setup lang="ts">
import { useScreenDispatch } from '~/components/editor/screens/useScreenDispatch';
import { useEditorStore } from '~/composables/editor/useEditorStore';

const { bcHome, bcStack } = useScreenDispatch();
const editorStore = useEditorStore();

function popScreen() {
  editorStore.popStack();
}
</script>

<style scoped lang="scss"></style>
