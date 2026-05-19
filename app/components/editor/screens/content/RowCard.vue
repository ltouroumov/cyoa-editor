<template>
  <div class="flex flex-col py-2 gap-2">
    <div class="flex flex-row gap-3 items-center">
      <RowMove :row-id="rowId" :index="index" />
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
      <CardMenu :object-id="rowId" :type="EntityType.Object" />
    </div>
    <div v-if="row.header" class="flex flex-row gap-2">
      <div>
        <Skeleton
          v-if="isNil(row.header?.image)"
          width="5rem"
          height="3rem"
          animation="none"
        />
        <ChoiceImage
          v-if="row.header?.image"
          :media-id="row.header.image"
          width="5rem"
        />
      </div>
      <div class="flex flex-col gap-2">
        <div v-if="row.header?.title !== row.name" class="font-bold">
          {{ row.header?.title }}
        </div>
        <div
          v-if="row.header?.text"
          class="max-h-[10rem] overflow-hidden text-ellipsis"
        >
          {{ row.header?.text }}
        </div>
        <div v-else class="text-surface-500 text-sm">No Description</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNil } from 'ramda';

import ChoiceImage from '~/components/editor/screens/content/choice/ChoiceImage.vue';
import RowMove from '~/components/editor/screens/content/row/RowMove.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { useProjectWriter } from '~/composables/editor/useProjectWriter';
import { EntityType } from '~/composables/project/types/v2/base';
import type { RowObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectClipboard } from '~/composables/project/useProjectClipboard';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $confirm = useConfirm();

const editorStore = useEditorStore();
const projectStore = useProjectStore();
const projectWriter = useProjectWriter();
const clipboardUtils = useProjectClipboard();

const props = defineProps<{
  rowId: string;
  index: number;
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

function copyRow() {
  clipboardUtils.copyObject(props.rowId);
}

function deleteRow($event: any) {
  $confirm.require({
    group: 'modal',
    target: $event.currentTarget,
    icon: 'pi pi-exclamation-triangle',
    header: 'Remove Row',
    message: 'Are you sure?',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
    },
    accept: () => {
      projectWriter.removeObject(props.rowId);
    },
  });
}
</script>

<style scoped lang="scss"></style>
