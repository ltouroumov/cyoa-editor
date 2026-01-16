<template>
  <div class="flex flex-col gap-2">
    <DataView
      :value="filteredStyles"
      data-key="id"
      :dt="{ header: { padding: '1rem 0' } }"
    >
      <template #header>
        <div class="flex flex-row justify-between items-center">
          <h3 class="text-xl font-bold text-primary">Styles</h3>
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
          <StylesItem
            v-for="(item, index) in items"
            :key="item.id"
            :style="item"
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
import { filter, includes, isEmpty, toLower, values } from 'ramda';

import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

const allStyles = computed(() => {
  return values(projectStore.styles.rules);
});

const filteredStyles = computed(() => {
  const _search = search.value;
  if (isEmpty(_search)) {
    return allStyles.value;
  } else {
    const _searchLC = toLower(_search);
    return filter((style) => {
      const name = toLower(style.name ?? style.id);
      const target = toLower(style.target);
      const type = toLower(style.type);
      const comment = toLower(style.comment ?? '');
      return (
        includes(_searchLC, name) ||
        includes(_searchLC, target) ||
        includes(_searchLC, type) ||
        includes(_searchLC, comment)
      );
    }, allStyles.value);
  }
});

const searchRaw = ref<string>('');
const search = refDebounced(searchRaw, 100);
</script>
<style scoped lang="scss"></style>
