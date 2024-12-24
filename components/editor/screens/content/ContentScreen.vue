<template>
  <DataView :value="pages" data-key="id">
    <template #list="{ items }">
      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="item in items"
          :key="item.id"
          class="col-span-3 md:col-span-1"
        >
          <PageCard :page-id="item.id" />
        </div>
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const pages = computed(() => {
  return projectStore.getChildren('@root');
});
</script>

<style scoped lang="scss"></style>
