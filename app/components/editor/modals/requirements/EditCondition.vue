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
        @click="$emit('update', undefined)"
      />
      <IconButton
        v-if="isNil($props.condition)"
        icon="iconify solar--add-circle-line-duotone"
        size="small"
        variant="text"
        @click="addCondition()"
      />
    </div>
    <div
      v-if="isNotNil($props.condition)"
      class="p-2 bg-surface-900 border border-surface-700 font-mono"
    >
      <EditConditionTerm
        :term="$props.condition"
        :depth="0"
        @update="(newValue) => $emit('update', newValue)"
        @remove="$emit('update', undefined)"
      />
    </div>
    <div
      v-else
      class="p-2 bg-surface-900 border border-surface-700 font-mono text-muted-color"
      :class="{ 'min-h-50': !compact }"
    >
      <div>No Condition</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNil, isNotNil } from 'ramda';

import { useAddConditionModal } from '~/components/editor/modals/requirements/useAddConditionModal';
import type { ConditionTerm } from '~/composables/project/types/v2/condition';

const { showAddConditionModal } = useAddConditionModal();

const $props = defineProps<{
  title: string;
  condition?: ConditionTerm;
  compact?: boolean;
}>();

const $emit = defineEmits<{
  (e: 'update', condition: ConditionTerm | undefined): void;
}>();

const addCondition = () => {
  showAddConditionModal((term) => $emit('update', term));
};
</script>

<style scoped lang="scss"></style>
