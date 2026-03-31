<template>
  <div v-if="row.layout" class="flex flex-col gap-2 grow">
    <IftaLabel>
      <div class="p-component p-inputtext flex flex-row gap-1 items-start">
        <div class="flex flex-row gap-1 items-center grow">
          <span v-for="style in rowStyles" :key="style.id" class="mr-2">
            {{ style.name }}
          </span>
        </div>
        <IconButton
          severity="secondary"
          icon="iconify solar--pen-line-duotone"
          class="shrink-0"
        />
      </div>
      <label>Row Style</label>
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

const rowStyles = computed(() => {
  return (row.value.styles ?? []).map((styleId) => {
    return projectStore.styles.rules[styleId];
  });
});

const StylesList = [];
</script>

<style scoped lang="scss"></style>
