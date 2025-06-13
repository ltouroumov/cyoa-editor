<template>
  <div class="flex flex-col gap-2 grow">
    <IftaLabel>
      <InputNumber v-model="row.requirements.allowedChoices" />
      <label>Allowed Choices</label>
    </IftaLabel>
    <IftaLabel>
      <label>Display Condition</label>
      <div
        v-if="row.requirements.display"
        class="p-component p-inputtext flex flex-row gap-1 items-start"
      >
        <ConditionDisplayShort :term="row.requirements.display" class="grow" />
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
</template>

<script setup lang="ts">
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
</script>

<style scoped lang="scss"></style>
