<template>
  <div class="flex flex-col">
    <component
      :is="dispatch.component"
      :term="$props.term"
      :depth="$props.depth"
      @update="(newValue: ConditionTerm) => $emit('update', newValue)"
      @remove="$emit('remove')"
    />
    <div v-if="depth === 0" class="flex flex-row mt-4 items-center">
      <div class="border-t border-surface-600 flex-1"></div>
      <div class="flex flex-row gap-2 mx-2">
        <div
          class="bg-surface-800 px-2 py-1 rounded text-muted-color text-sm flex flex-row items-center gap-1"
        >
          <span class="iconify solar--add-circle-line-duotone"></span> AND
        </div>
        <div
          class="bg-surface-800 px-2 py-1 rounded text-muted-color text-sm flex flex-row items-center gap-1"
        >
          <span class="iconify solar--add-circle-line-duotone"></span> OR
        </div>
      </div>
      <div class="border-t border-surface-600 my-2 flex-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { P, match } from 'ts-pattern';

import EditAllOfTerm from '~/components/editor/modals/requirements/term/EditAllOfTerm.vue';
import EditAnyOfTerm from '~/components/editor/modals/requirements/term/EditAnyOfTerm.vue';
import EditSelectedTerm from '~/components/editor/modals/requirements/term/EditSelectedTerm.vue';
import type { ConditionTerm } from '~/composables/project/types/v2/condition';

const $props = defineProps<{
  term: ConditionTerm;
  depth: number;
}>();

const $emit = defineEmits<{
  (e: 'update', term: ConditionTerm): void;
  (e: 'remove'): void;
}>();

const dispatch = computed<{ component: any }>(() => {
  return match($props.term)
    .with({ allOf: P.array() }, () => ({
      component: EditAllOfTerm,
    }))
    .with({ anyOf: P.array() }, () => ({
      component: EditAnyOfTerm,
    }))
    .with({ isSelected: P.string }, () => ({
      component: EditSelectedTerm,
    }))
    .otherwise(() => ({ component: null }));
});
</script>

<style scoped lang="scss"></style>
