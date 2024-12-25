<template>
  <div class="flex flex-col gap-2">
    <Fluid>
      <div class="flex flex-col gap-2 justify-stretch">
        <div class="flex flex-row gap-2">
          <IftaLabel class="grow">
            <InputText v-model.lazy="row.name" />
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
</template>

<script setup lang="ts">
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  rowId: string;
}>();

const row = computed(() => {
  return projectStore.get(props.rowId, ObjectType.row)!;
});
</script>
