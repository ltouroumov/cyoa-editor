<template>
  <div class="flex flex-col gap-2 grow">
    <div class="flex flex-row gap-2 items-center h-6">
      <div class="size-6 iconify solar--box-minimalistic-line-duotone"></div>
      <div class="font-bold text-lg text-primary grow">{{ object.name }}</div>
      <div class="text-muted-color font-mono">{{ object.type }}</div>
    </div>
    <div v-if="object.type === 'choice'" class="flex flex-row gap-2">
      <div class="flex flex-col gap-2">
        <div class="font-bold">{{ object.header?.title }}</div>
        <div class="max-h-30 overflow-hidden text-ellipsis">
          {{ object.header?.text }}
        </div>
      </div>
      <div>
        <Skeleton
          v-if="isNil(object.header?.image)"
          width="5rem"
          height="3rem"
          animation="none"
        />
        <ChoiceImage
          v-if="object.header?.image"
          :media-id="object.header.image"
          width="5rem"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNil } from 'ramda';

import ChoiceImage from '~/components/editor/screens/content/choice/ChoiceImage.vue';
import type { AnyObject } from '~/composables/project/types/v2/objects';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $project = useProjectStore();

const props = defineProps<{
  object: AnyObject;
  from?: string;
}>();

const parent = computed((): AnyObject | undefined => {
  if (isNil(props.from)) return undefined;
  else return $project.objects.get(props.from);
});
</script>

<style scoped lang="scss"></style>
