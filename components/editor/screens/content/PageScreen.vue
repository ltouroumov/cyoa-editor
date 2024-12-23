<template>
  <div class="grid grid-cols-2 gap-2">
    <h3 class="col-span-2 text-xl font-bold text-primary">Properties</h3>
    <label class="font-bold" for="pageName">Name</label>
    <InputText v-model="page.name" fluid />
  </div>
  <DataView
    :value="children"
    data-key="id"
    :dt="{ header: { padding: '1rem 0' } }"
  >
    <template #header>
      <h3 class="text-xl font-bold text-primary">Children</h3>
    </template>
    <template #list="{ items }">
      <div class="flex flex-col">
        <div v-for="(item, index) in items" :key="index">
          <div
            class="flex flex-row gap-3 py-2"
            :class="{
              'border-t border-surface-200 dark:border-surface-700':
                index !== 0,
            }"
          >
            <div>{{ item.name }}</div>
          </div>
        </div>
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { map } from 'ramda';

import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  pageId: string;
}>();

const page = computed(() => projectStore.content.entries[props.pageId]);
const children = computed(() => {
  return map((rowId) => {
    return projectStore.content.entries[rowId];
  }, projectStore.content.children[props.pageId] ?? []);
});
</script>

<style scoped lang="scss"></style>
