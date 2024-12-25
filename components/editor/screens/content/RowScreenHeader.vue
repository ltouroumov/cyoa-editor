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

        <div class="grid grid-cols-4 gap-2">
          <div v-if="row.header" class="flex flex-col gap-2 col-span-2">
            <div class="flex flex-row justify-between">
              <h3 class="font-bold text-xl">Header</h3>
              <IconButton
                outlined
                severity="danger"
                icon="iconify solar--trash-bin-trash-line-duotone"
                size="small"
              />
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div
                class="flex flex-col gap-2 items-stretch justify-center grow"
              >
                <div
                  class="flex flex-row justify-stretch grow relative group rounded overflow-auto"
                >
                  <Skeleton
                    v-if="isNil(row.header?.image)"
                    animation="none"
                    class="grow"
                    height="auto"
                  />
                  <RowImage
                    v-if="row.header.image"
                    :media-id="row.header.image"
                    class="grow border border-surface-700"
                  />
                  <div
                    class="absolute bg-slate-500/50 top-0 left-0 right-0 bottom-0 opacity-0 group-hover:opacity-100 duration-300 flex flex-row items-center justify-center cursor-pointer"
                  >
                    <i class="iconify solar--pen-line-duotone" />
                    <IconButton
                      v-if="row.header.image"
                      outlined
                      severity="danger"
                      icon="iconify solar--trash-bin-trash-line-duotone"
                      class="absolute right-[0.5rem] bottom-[0.5rem]"
                    />
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-2 col-span-2">
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
          </div>
          <div class="flex flex-col gap-2 grow">
            <h3 class="font-bold text-xl">Layout</h3>
            <IftaLabel>
              <InputText />
              <label class="font-bold" for="rowName">Grid Columns</label>
            </IftaLabel>
            <IftaLabel>
              <InputText />
              <label class="font-bold" for="rowName">Default Width</label>
            </IftaLabel>
          </div>
          <div class="flex flex-col gap-2 grow">
            <h3 class="font-bold text-xl">Conditions</h3>
          </div>
        </div>
      </div>
    </Fluid>
  </div>
</template>

<script setup lang="ts">
import { isNil } from 'ramda';

import RowImage from '~/components/editor/screens/content/RowImage.vue';
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
