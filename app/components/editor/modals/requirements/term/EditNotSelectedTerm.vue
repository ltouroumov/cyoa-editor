<template>
  <div class="flex flex-row gap-2">
    <div
      class="bg-surface-800 px-2 py-1 rounded flex flex-row gap-2 items-center flex-1"
    >
      <span>Not Selected:</span>
      <span class="flex-1 text-ellipsis">{{ name }}</span>
      <span class="text-muted-color text-sm">
        ({{ $props.term.isNotSelected }})
      </span>
    </div>
    <div>
      <IconButton
        icon="iconify solar--trash-bin-trash-line-duotone"
        size="small"
        variant="text"
        severity="secondary"
        @click="$emit('remove')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ConditionTerm,
  IsNotSelectedCondition,
} from '~/composables/project/types/v2/condition';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $project = useProjectStore();

const $props = defineProps<{
  term: IsNotSelectedCondition;
}>();

const $emit = defineEmits<{
  (e: 'update', term: ConditionTerm): void;
  (e: 'remove'): void;
}>();

const name = computed(() => {
  const choice = $project.get($props.term.isNotSelected, ObjectType.choice);
  return choice?.name;
});
</script>

<style scoped lang="scss"></style>
