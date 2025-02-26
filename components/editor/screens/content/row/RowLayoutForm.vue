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

const GridItemPositions = [
  { label: 'Left-Aligned', value: 'left' },
  { label: 'Centered', value: 'center' },
  { label: 'Right-Aligned', value: 'right' },
];
const GridItemWidths = [
  { label: 'Full Width', value: 60 },
  { label: '1/2 Width', value: 30 },
  { label: '1/3 Width', value: 20 },
  { label: '1/4 Width', value: 15 },
  { label: '1/5 Width', value: 12 },
  { label: '1/10 Width', value: 6 },
  { label: '11/12 Columns', value: 55 },
  { label: '10/12 Columns', value: 50 },
  { label: '9/12 Columns', value: 45 },
  { label: '8/12 Columns', value: 40 },
  { label: '7/12 Columns', value: 35 },
  { label: '5/12 Columns', value: 25 },
  { label: '2/12 Columns', value: 10 },
  { label: '1/12 Columns', value: 5 },
];
</script>

<style scoped lang="scss"></style>
