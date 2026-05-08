<template>
  <div class="flex flex-row gap-1">
    <div class="flex flex-col items-center">
      <div class="bg-surface-800 px-2 py-1 rounded mb-2">OR</div>
      <div class="border-s border-surface-600 flex-1"></div>
      <div class="border-b border-surface-600 my-2 w-1/2"></div>
    </div>
    <div class="flex flex-col gap-1 flex-1">
      <EditConditionTerm
        v-for="(child, idx) in term.anyOf"
        :key="idx"
        :term="child"
        :depth="depth + 1"
        @update="updateChild(idx, $event)"
        @remove="removeChild(idx)"
      />

      <div class="flex flex-row items-center justify-start">
        <Button size="small" severity="secondary" @click="addChild()">
          <span class="iconify solar--add-circle-line-duotone"></span> OR
        </Button>
        <div
          class="flex-1 border-t border-dashed border-surface-600 ms-2"
        ></div>
        <IconButton
          icon="iconify solar--trash-bin-trash-line-duotone"
          size="small"
          variant="text"
          severity="secondary"
          @click="removeSelf()"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { append, head, length, modify, remove, update } from 'ramda';

import { useAddConditionModal } from '~/components/editor/modals/requirements/useAddConditionModal';
import type {
  AnyOfCondition,
  ConditionTerm,
} from '~/composables/project/types/v2/condition';

const { showAddConditionModal } = useAddConditionModal();

const $props = defineProps<{
  term: AnyOfCondition;
  depth: number;
}>();

const $emit = defineEmits<{
  (e: 'update', term: ConditionTerm): void;
  (e: 'remove'): void;
}>();

const addChild = () => {
  showAddConditionModal((result) => {
    $emit(
      'update',
      modify('anyOf', append<ConditionTerm>(result), $props.term),
    );
  });
};

const updateChild = (idx: number, term: ConditionTerm) => {
  $emit('update', modify('anyOf', update(idx, term), $props.term));
};

const removeChild = (idx: number) => {
  const newTerm = modify('anyOf', remove(idx, 1), $props.term);
  if (length(newTerm.anyOf) > 1) {
    $emit('update', newTerm);
  } else if (length(newTerm.anyOf) === 1) {
    $emit('update', head(newTerm.anyOf)!);
  } else {
    $emit('remove');
  }
};

const removeSelf = () => {
  if (length($props.term.anyOf) > 0) {
    $emit('update', head($props.term.anyOf)!);
  } else {
    $emit('remove');
  }
};
</script>

<style scoped lang="scss"></style>
