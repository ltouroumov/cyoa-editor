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

        <div class="flex flex-col">
          <div
            class="border-b border-surface-700 pb-1 mb-2 flex flex-row justify-between items-center"
          >
            <div class="text-xl font-bold text-primary grow">Header</div>
            <div v-if="row.header" class="flex flex-row gap-2 items-center">
              <div class="flex flex-row gap-1 items-center">
                <Checkbox
                  v-model="row.header.isExtended"
                  binary
                  input-id="header-extended"
                />
                <label for="header-extended">Extended</label>
              </div>
              <Button
                variant="link"
                icon="iconify solar--trash-bin-trash-line-duotone"
                size="small"
                @click="deleteRowHeader"
              />
            </div>
          </div>
          <RowHeaderForm v-model="row" />
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="flex flex-col grow flex-1">
            <div class="border-b border-surface-700 pb-1 mb-2">
              <div class="text-xl font-bold text-primary">Layout</div>
            </div>
            <RowLayoutForm v-model="row" />
          </div>
          <div class="flex flex-col grow flex-1">
            <div class="border-b border-surface-700 pb-1 mb-2">
              <div class="text-xl font-bold text-primary">Requirements</div>
            </div>
            <RowRequirementsForm v-model="row" />
          </div>
          <div class="flex flex-col grow flex-1">
            <div class="border-b border-surface-700 pb-1 mb-2">
              <div class="text-xl font-bold text-primary">Row Styles</div>
            </div>
            <RowStyleForm v-model="row" />
          </div>
        </div>
      </div>
    </Fluid>
  </div>
</template>

<script setup lang="ts">
import RowRequirementsForm from '~/components/editor/screens/content/row/RowRequirementsForm.vue';
import { useDraftObject } from '~/composables/editor/draft/useDraftObject';
import { ObjectType } from '~/composables/project/types/v2/objects/base';

const props = defineProps<{
  rowId: string;
}>();

const row = useDraftObject(() => props.rowId, ObjectType.row);

const deleteRowHeader = () => {
  row.value.header = undefined;
};
</script>
