<template>
  <Fluid>
    <div class="flex flex-col gap-2 items-stretch">
      <div class="flex flex-row gap-2">
        <IftaLabel class="grow">
          <InputText v-model.lazy="choice.name" />
          <label>Name</label>
        </IftaLabel>
        <IftaLabel>
          <InputText v-model="choice.id" disabled />
          <label>ID</label>
        </IftaLabel>
      </div>

      <div class="flex flex-col">
        <div class="border-b border-surface-700 pb-1 mb-2">
          <div class="text-xl font-bold text-primary">Header</div>
        </div>
        <ChoiceHeaderForm :choice-id="choiceId" />
      </div>
      <div class="flex flex-col">
        <div class="border-b border-surface-700 pb-1 mb-2">
          <div class="text-xl font-bold text-primary">Components</div>
        </div>
        <ChoiceComponentsForm :choice-id="choiceId" />
      </div>
    </div>
  </Fluid>
  <DataView
    :value="children"
    data-key="id"
    :dt="{ header: { padding: '1rem 0' }, content: { padding: '1rem 0' } }"
  >
    <template #header>
      <div class="flex flex-row justify-between items-center">
        <h3 class="text-xl font-bold text-primary">Addons</h3>
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
      <div class="grid grid-cols-3 gap-2">
        <AddonCard
          v-for="(item, index) in items"
          :key="index"
          :addon-id="item.id"
          :index="index as number"
        />
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { filter, includes, isEmpty, toLower } from 'ramda';

import ChoiceComponentsForm from '~/components/editor/screens/content/choice/ChoiceComponentsForm.vue';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  choiceId: string;
}>();

const choice = computed((): ChoiceObject => {
  return projectStore.get(props.choiceId, ObjectType.choice)!;
});

const children = computed(() => {
  const _search = search.value;
  if (isEmpty(_search)) {
    return projectStore.getChildren(props.choiceId);
  } else {
    const _searchLC = toLower(_search);
    return filter(({ id }) => {
      const choice = projectStore.get(id, ObjectType.addon)!;
      return includes(_searchLC, toLower(choice.name));
    }, projectStore.getChildren(props.choiceId));
  }
});

const searchRaw = ref<string>('');
const search = refDebounced(searchRaw, 100);
</script>

<style scoped lang="scss"></style>
