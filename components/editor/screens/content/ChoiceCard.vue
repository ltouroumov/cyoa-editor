<template>
  <div class="flex flex-col gap-2 rounded border border-surface-700 p-3">
    <div class="flex flex-row justify-between">
      <div class="flex flex-row gap-2">
        <Button
          variant="outlined"
          severity="secondary"
          size="small"
          icon="iconify solar--arrow-left-line-duotone"
          :dt="{}"
        />
        <Button
          variant="outlined"
          severity="secondary"
          size="small"
          icon="iconify solar--arrow-right-line-duotone"
        />
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
    <div class="flex flex-row items-center">
      <div class="text-primary text-xl font-bold grow">{{ choice.name }}</div>
      <div class="text-surface-500 text-sm">{{ choice.id }}</div>
    </div>
    <div class="flex flex-row gap-2">
      <div>
        <Skeleton
          v-if="isNil(choice.header?.image)"
          width="5rem"
          height="3rem"
          animation="none"
        />
        <ChoiceImage
          v-if="choice.header?.image"
          :media-id="choice.header.image"
          width="5rem"
        />
      </div>
      <div class="flex flex-col gap-2">
        <div class="font-bold">{{ choice.header?.title }}</div>
        <div>{{ choice.header?.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNil } from 'ramda';

import ChoiceImage from '~/components/editor/screens/content/ChoiceImage.vue';
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
