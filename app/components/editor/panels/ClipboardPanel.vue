<template>
  <Drawer
    v-model:visible="editorStore.showClipboard"
    position="right"
    pt:footer="p-0"
    class="w-[40%]"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <div class="size-10 iconify solar--clipboard-list-bold-duotone"></div>
        <span class="font-bold">Clipboard</span>
      </div>
    </template>
    <div class="flex flex-col gap-2">
      <template v-for="(item, idx) in projectStore.clipboard" :key="item.id">
        <ClipboardEntry :entry="item" />
      </template>
    </div>
    <template #footer>
      <div class="flex flex-col items-center gap-2">
        <Paginator
          :rows="10"
          :total-records="100"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          class="w-full"
        />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import ClipboardEntry from '~/components/editor/panels/clipboard/ClipboardEntry.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();
</script>

<style scoped lang="scss"></style>
