<template>
  <div class="flex flex-row gap-3 py-2 items-start">
    <div class="flex flex-row gap-2">
      <IconButton
        outlined
        severity="secondary"
        icon="iconify solar--arrow-up-line-duotone"
        @click="moveUp()"
      />
      <IconButton
        outlined
        severity="secondary"
        icon="iconify solar--arrow-down-line-duotone"
        @click="moveDown()"
      />
    </div>
    <div class="flex flex-col gap-2 grow justify-center">
      <div
        class="flex flex-row gap-2 items-center cursor-pointer group"
        @click="editRow()"
      >
        <div class="text-primary font-bold grow group-hover:underline">
          {{ row.name }}
        </div>
        <div class="text-surface-500 font-mono text-sm">
          {{ row.id }}
        </div>
      </div>
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
import { clone, findIndex, propEq } from 'ramda';

import { useEditorStore } from '~/composables/editor/useEditorStore';
import type {
  ChildObject,
  RowObject,
} from '~/composables/project/types/v2/objects';
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

function moveUp() {
  const parentId: string = projectStore.getParent(row.value.id)!;
  const childArr: ChildObject[] = clone(projectStore.children.get(parentId)!);

  const childIndex = findIndex(propEq(row.value.id, 'id'), childArr);
  if (childIndex > 0) {
    const moveArr = childArr.splice(childIndex, 1);
    childArr.splice(childIndex - 1, 0, ...moveArr);
    projectStore.children.set(parentId, childArr);
  }
}

function moveDown() {
  const parentId: string = projectStore.getParent(row.value.id)!;
  const childArr: ChildObject[] = clone(projectStore.children.get(parentId)!);

  const childIndex = findIndex(propEq(row.value.id, 'id'), childArr);
  if (childIndex > -1 && childIndex < childArr.length - 1) {
    const moveArr = childArr.splice(childIndex, 1);
    childArr.splice(childIndex + 1, 0, ...moveArr);
    projectStore.children.set(parentId, childArr);
  }
}
</script>

<style scoped lang="scss"></style>
