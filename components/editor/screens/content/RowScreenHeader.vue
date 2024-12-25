<template>
  <div class="flex flex-col gap-2">
    <Fluid>
      <div class="flex flex-col gap-2 justify-stretch">
        <div class="flex flex-row gap-2">
          <IftaLabel class="grow">
            <InputText v-model.lazy="row.name" />
            <label>Name</label>
          </IftaLabel>
          <IftaLabel>
            <InputText v-model="row.id" disabled />
            <label>ID</label>
          </IftaLabel>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <div v-if="row.header" class="flex flex-col gap-2 col-span-2">
            <h3 class="font-bold text-xl">Header</h3>
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
                  <label>Title</label>
                </IftaLabel>
                <IftaLabel>
                  <Textarea v-model="row.header.text" class="min-h-[10rem]" />
                  <label>Text</label>
                </IftaLabel>
              </div>
            </div>
          </div>
          <div v-if="row.layout" class="flex flex-col gap-2 grow">
            <h3 class="font-bold text-xl">Layout</h3>
            <IftaLabel>
              <Select
                v-model="row.layout.itemAlign"
                :options="GridItemPositions"
                option-label="label"
                option-value="value"
              />
              <label>Item Position</label>
            </IftaLabel>
            <IftaLabel>
              <InputNumber v-model="row.layout.itemWidth" />
              <label>Item Width</label>
            </IftaLabel>
          </div>
          <div class="flex flex-col gap-2 grow">
            <h3 class="font-bold text-xl">Conditions</h3>
            <IftaLabel>
              <InputNumber v-model="row.requirements.allowedChoices" />
              <label>Allowed Choices</label>
            </IftaLabel>
            <IftaLabel>
              <label>Display Condition</label>
              <div
                v-if="row.requirements.display"
                class="p-component p-inputtext flex flex-row gap-1 items-center"
              >
                <ConditionDisplayShort
                  :term="row.requirements.display"
                  class="grow"
                />
                <IconButton
                  severity="secondary"
                  icon="iconify solar--pen-line-duotone"
                  class="shrink-0"
                />
              </div>
              <div
                v-else
                class="p-component p-inputtext flex flex-row gap-1 items-center"
              >
                <div class="text-secondary grow">Always Visible</div>

                <IconButton
                  severity="secondary"
                  icon="iconify solar--add-circle-line-duotone"
                  class="shrink-0"
                />
              </div>
            </IftaLabel>
          </div>
        </div>
      </div>
    </Fluid>
  </div>
</template>

<script setup lang="ts">
import { isNil } from 'ramda';

import RowImage from '~/components/editor/screens/content/RowImage.vue';
import type { RowObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  rowId: string;
}>();

const row = computed((): RowObject => {
  return projectStore.get(props.rowId, ObjectType.row)!;
});

const GridColumnChoices = [
  { label: '12 columns', value: 12 },
  { label: '6 columns', value: 6 },
  { label: '3 columns', value: 3 },
];
const GridItemPositions = [
  { label: 'Left-Aligned', value: 'left' },
  { label: 'Centered', value: 'center' },
  { label: 'Right-Aligned', value: 'right' },
];
</script>
