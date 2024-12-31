<template>
  <div v-if="choice.header" class="grid grid-cols-3 gap-2">
    <div class="flex flex-col gap-2 items-stretch justify-center grow">
      <div
        class="flex flex-row justify-stretch grow relative group rounded overflow-auto"
      >
        <Skeleton
          v-if="isNil(choice.header?.image)"
          animation="none"
          class="grow"
          height="auto"
        />
        <RowImage
          v-if="choice.header.image"
          :media-id="choice.header.image"
          class="grow border border-surface-700"
        />
        <div
          class="absolute bg-slate-500/50 top-0 left-0 right-0 bottom-0 opacity-0 group-hover:opacity-100 duration-300 flex flex-row items-center justify-center cursor-pointer"
        >
          <i class="iconify solar--pen-line-duotone" />
          <IconButton
            v-if="choice.header.image"
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
        <InputText v-model="choice.header.title" />
        <label>Title</label>
      </IftaLabel>
      <Editor v-model="choice.header.text" class="min-h-[10rem]" />
    </div>
  </div>
  <div v-else class="flex flex-row justify-center items-center min-h-[10rem]">
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
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  choiceId: string;
}>();

const choice = computed((): ChoiceObject => {
  return projectStore.get(props.choiceId, ObjectType.choice)!;
});
</script>

<style scoped lang="scss"></style>
