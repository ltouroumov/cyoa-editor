<template>
  <DataView :value="pages" data-key="id">
    <template #list="{ items }">
      <div class="container-fluid">
        <div class="row">
          <div v-for="item in items" :key="item.id" class="col-md-3">
            <div class="border border-surface-500 flex flex-col p-2 rounded">
              <div
                class="text-primary text-xl text-bold inline-flex items-center"
              >
                <i class="iconify solar--document-text-line-duotone"></i>
                <span class="grow">{{ item.name }}</span>
                <span class="font-mono text-sm text-surface-500">{{
                  item.id
                }}</span>
              </div>
              <div>
                <Button @click="editPage(item.id)"> Edit </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { map } from 'ramda';

import { useEditorStore } from '~/composables/editor/useEditorStore';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const pages = computed(() => {
  return map((pageId) => {
    return projectStore.content.entries[pageId];
  }, projectStore.content.children['@root'] ?? []);
});

function editPage(pageId: string) {
  editorStore.pushScreen({
    type: 'edit-page',
    pageId: pageId,
  });
}
</script>

<style scoped lang="scss"></style>
