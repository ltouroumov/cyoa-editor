<template>
  <div class="flex flex-col gap-2">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div class="grid grid-cols-form gap-2 items-center">
        <label class="font-bold" for="pageName">Name</label>
        <InputText v-model="page.name" fluid />
      </div>
      <div>Layout</div>
      <div>Style</div>
    </div>
    <DataView
      :value="children"
      data-key="id"
      :dt="{ header: { padding: '1rem 0' } }"
    >
      <template #header>
        <div class="flex flex-row justify-between items-center">
          <h3 class="text-xl font-bold text-primary">Rows</h3>
          <InputGroup class="w-auto min-w-8">
            <InputGroupAddon>
              <i class="iconify solar--filter-line-duotone" />
            </InputGroupAddon>
            <InputText v-model="searchRaw" size="small" />
            <InputGroupAddon>
              <Button
                icon="iconify solar--close-circle-line-duotone"
                severity="secondary"
                @click="searchRaw = ''"
              />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </template>
      <template #list="{ items }">
        <div class="flex flex-col">
          <RowCard
            v-for="(item, index) in items"
            :key="index"
            :row-id="item.id"
            :index="index"
            :class="{
              'border-t border-surface-200 dark:border-surface-700':
                index !== 0,
            }"
          />
        </div>
      </template>
    </DataView>
  </div>
</template>

<script setup lang="ts">
import { filter, includes, isEmpty, toLower } from 'ramda';

import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  pageId: string;
}>();

const page = computed(() => {
  return projectStore.get(props.pageId, ObjectType.page)!;
});

const children = computed(() => {
  const _search = search.value;
  if (isEmpty(_search)) {
    return projectStore.getChildren(props.pageId);
  } else {
    const _searchLC = toLower(_search);
    return filter(({ id }) => {
      const row = projectStore.get(id, ObjectType.row)!;
      return includes(_searchLC, toLower(row.name));
    }, projectStore.getChildren(props.pageId));
  }
});

const searchRaw = ref<string>('');
const search = refDebounced(searchRaw, 100);
</script>

<style scoped lang="scss"></style>
