<template>
  <div v-if="row.header" class="grid grid-cols-3 gap-2">
    <div
      v-if="row.header.isExtended"
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
            class="absolute right-2 bottom-2"
          />
        </div>
      </div>
    </div>
    <div
      class="flex flex-col gap-2"
      :class="{
        'col-span-3': !row.header.isExtended,
        'col-span-2': row.header.isExtended,
      }"
    >
      <IftaLabel>
        <InputText v-model="row.header.title" />
        <label>Title</label>
      </IftaLabel>
      <Editor
        v-if="row.header.isExtended"
        v-model="row.header.text"
        editor-style="height: 12rem;"
      />
    </div>
  </div>
  <div v-else class="flex flex-row justify-center items-center min-h-40">
    <Button
      variant="outlined"
      severity="secondary"
      icon="iconify iconify solar--add-circle-line-duotone"
      label="Add Header"
    />
  </div>
</template>

<script setup lang="ts">
import { isNil } from 'ramda';

import RowImage from '~/components/editor/screens/content/row/RowImage.vue';
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
