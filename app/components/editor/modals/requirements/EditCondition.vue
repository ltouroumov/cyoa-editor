<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2">
      <span class="font-bold text-primary text-md flex-1">
        {{ title }}
      </span>
      <IconButton
        v-if="isNotNil($props.condition)"
        icon="iconify solar--trash-bin-trash-line-duotone"
        size="small"
        variant="text"
      />
    </div>
    <div
      v-if="isNotNil($props.condition)"
      class="p-2 bg-surface-900 border border-surface-700 font-mono"
    >
      <EditConditionTerm :term="$props.condition" :depth="0" />
    </div>
    <div v-else>add condition</div>
  </div>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';

const $props = defineProps<{
  title: string;
  condition?: ConditionTerm;
}>();

const $emit = defineEmits<{
  (e: 'update', condition: ConditionTerm): void;
}>();
</script>

<style scoped lang="scss"></style>
