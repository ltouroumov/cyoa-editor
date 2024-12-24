<template>
  <div class="flex flex-col gap-2">
    <Fluid>
      <div class="flex flex-col gap-2 justify-stretch">
        <div class="flex flex-row gap-2">
          <IftaLabel class="grow">
            <InputText v-model="row.name" />
            <label class="font-bold" for="rowName">Name</label>
          </IftaLabel>
          <IftaLabel>
            <InputText v-model="row.id" disabled />
            <label class="font-bold" for="rowName">ID</label>
          </IftaLabel>
        </div>

        <div v-if="row.header" class="flex flex-col gap-2">
          <h3 class="font-bold text-xl">Header</h3>
          <IftaLabel>
            <InputText v-model="row.header.title" />
            <label class="font-bold" for="rowName">Title</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea v-model="row.header.text" class="min-h-[10rem]" />
            <label class="font-bold" for="rowName">Text</label>
          </IftaLabel>
        </div>
      </div>
    </Fluid>
  </div>
  <DataView
    :value="children"
    data-key="id"
    :dt="{ header: { padding: '1rem 0' }, content: { padding: '1rem 0' } }"
  >
    <template #header>
      <div class="flex flex-row justify-between items-center">
        <h3 class="text-xl font-bold text-primary">Choices</h3>
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
      <div class="grid grid-cols-12 gap-2">
        <ChoiceCard
          v-for="(item, index) in items"
          :key="index"
          :choice-id="item.id"
          :class="`col-span-${item.layout?.width ?? row.layout?.defaultWidth ?? 12}`"
        />
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { filter, includes, isEmpty, toLower } from 'ramda';

import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  rowId: string;
}>();

const row = computed(() => {
  return projectStore.get(props.rowId, ObjectType.row)!;
});

const children = computed(() => {
  const _search = search.value;
  if (isEmpty(_search)) {
    return projectStore.getChildren(props.rowId);
  } else {
    const _searchLC = toLower(_search);
    return filter(({ id }) => {
      const choice = projectStore.get(id, ObjectType.choice)!;
      return includes(_searchLC, toLower(choice.name));
    }, projectStore.getChildren(props.rowId));
  }
});

const searchRaw = ref<string>('');
const search = refDebounced(searchRaw, 100);
</script>

<style scoped lang="scss"></style>
