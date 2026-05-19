<template>
  <div class="flex flex-col gap-2 grow">
    <div class="flex flex-row gap-2 items-center h-6">
      <div class="size-6 iconify solar--card-2-line-duotone"></div>
      <div class="font-bold text-lg text-primary grow">{{ object.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectScore } from '~/composables/project/types/v2/score';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $project = useProjectStore();

const props = defineProps<{
  object: ProjectScore;
}>();
</script>

<style scoped lang="scss"></style>
