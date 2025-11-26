<template>
  <div v-if="row.layout" class="flex flex-col gap-2 grow">
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
      <Select
        v-model="row.layout.itemWidth"
        :options="GridItemWidths"
        option-label="label"
        option-value="value"
      />
      <label>Item Width</label>
    </IftaLabel>
  </div>
</template>

<script setup lang="ts">
import { GridItemPositions, GridItemWidths } from '~/composables/editor/const';
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
