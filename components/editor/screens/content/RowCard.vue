<template>
  <div class="flex flex-row gap-3 py-2 items-start">
    <div class="flex flex-row gap-2">
      <Button
        variant="outlined"
        size="small"
        severity="secondary"
        icon="iconify solar--arrow-up-line-duotone"
      />
      <Button
        variant="outlined"
        size="small"
        severity="secondary"
        icon="iconify solar--arrow-down-line-duotone"
      />
    </div>
    <div class="flex flex-col gap-2 grow justify-center">
      <div
        class="flex flex-row gap-2 items-center cursor-pointer"
        @click="editRow()"
      >
        <div class="text-primary font-bold grow">{{ row.name }}</div>
        <div class="text-surface-500 font-mono text-sm">
          {{ row.id }}
        </div>
      </div>
      <div>Properties</div>
    </div>
    <div class="flex flex-row gap-2">
      <Button variant="outlined" size="small" severity="secondary">
        Clone
      </Button>
      <Button variant="outlined" size="small" severity="danger">
        Delete
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/composables/editor/useEditorStore';
import type { RowObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const props = defineProps<{
  rowId: string;
}>();

const row = computed((): RowObject => {
  return projectStore.get(props.rowId, ObjectType.row)!;
});

function editRow() {
  editorStore.pushScreen({
    type: 'edit-row',
    rowId: row.value.id,
  });
}
</script>

<style scoped lang="scss"></style>
