<template>
  <DataView
    :value="filteredImages"
    data-key="id"
    :dt="{ header: { padding: '1rem 0' }, content: { padding: '1rem 0' } }"
    :paginator="true"
    :rows="48"
  >
    <template #header>
      <div class="flex flex-row justify-between items-center">
        <InputGroup class="w-auto min-w-8">
          <InputGroupAddon>
            <i class="iconify solar--filter-line-duotone" />
          </InputGroupAddon>
          <InputText
            v-model="searchRaw"
            size="small"
            placeholder="Search images..."
          />
          <InputGroupAddon>
            <Button
              icon="iconify solar--close-circle-line-duotone"
              severity="secondary"
              @click="searchRaw = ''"
            />
          </InputGroupAddon>
        </InputGroup>
        <SelectButton
          v-model="viewMode"
          :options="[
            {
              label: 'Grid',
              value: 'grid',
              icon: 'iconify solar--widget-line-duotone',
            },
            {
              label: 'List',
              value: 'list',
              icon: 'iconify solar--list-line-duotone',
            },
          ]"
          option-label="label"
          option-value="value"
          size="small"
        >
          <template #option="{ option }">
            <i :class="option.icon"></i>
          </template>
        </SelectButton>
      </div>
    </template>
    <template #list="{ items }">
      <div v-if="viewMode === 'grid'" class="grid grid-cols-60 gap-2">
        <div
          v-for="item in items"
          :key="item.id"
          class="col-span-60 md:col-span-10"
        >
          <MediaCard :image="item.image" mode="grid" />
        </div>
      </div>
      <div v-else class="flex flex-col gap-2">
        <MediaCard
          v-for="item in items"
          :key="item.id"
          :image="item.image"
          mode="list"
        />
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { filter, includes, isEmpty, toLower } from 'ramda';

import { useProjectStoreRefs } from '~/composables/project/useProjectStore';

const { media } = useProjectStoreRefs();

const viewMode = ref<'grid' | 'list'>('grid');
const searchRaw = ref<string>('');
const search = refDebounced(searchRaw, 100);

const images = computed(() => {
  return Object.entries(media.value.images).map(([id, image]) => ({
    id,
    image,
  }));
});

const filteredImages = computed(() => {
  const _search = search.value;
  if (isEmpty(_search)) {
    return images.value;
  } else {
    const _searchLC = toLower(_search);
    return filter(({ id }) => {
      return includes(_searchLC, toLower(id));
    }, images.value);
  }
});
</script>

<style scoped lang="scss"></style>
