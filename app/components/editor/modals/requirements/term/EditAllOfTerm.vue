<template>
  <div class="flex flex-row gap-1">
    <div class="flex flex-col items-center">
      <div class="bg-surface-800 px-2 py-1 rounded mb-2">AND</div>
      <div class="border-s border-surface-600 flex-1"></div>
      <div class="border-b border-surface-600 my-2 w-1/2"></div>
    </div>
    <div class="flex flex-col gap-1">
      <EditConditionTerm
        v-for="(child, idx) in term.allOf"
        :key="idx"
        :term="child"
        :depth="depth + 1"
        @update="updateChild(idx, $event)"
        @remove="removeChild(idx)"
      />

      <div class="flex flex-row items-center justify-start">
        <div
          class="bg-surface-800 px-2 py-1 rounded text-muted-color text-sm flex flex-row items-center gap-1"
          @click="addChild()"
        >
          <span class="iconify solar--add-circle-line-duotone"></span> AND
        </div>
        <div
          class="flex-1 border-t border-dashed border-surface-600 mx-2"
        ></div>
        <IconButton
          icon="iconify solar--trash-bin-trash-line-duotone"
          size="small"
          variant="text"
          severity="secondary"
          @click="$emit('remove')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import { append, isNotNil, modify, remove, update } from 'ramda';

import type {
  AllOfCondition,
  ConditionTerm,
} from '~/composables/project/types/v2/condition';

const $dialog = useDialog();
const LazyAddConditionModal = defineAsyncComponent(
  () => import('~/components/editor/modals/requirements/AddConditionModal.vue'),
);

const $props = defineProps<{
  term: AllOfCondition;
  depth: number;
}>();

const $emit = defineEmits<{
  (e: 'update', term: ConditionTerm): void;
  (e: 'remove'): void;
}>();

const addChild = () => {
  $dialog.open(LazyAddConditionModal, {
    data: {},
    onClose: (
      options: DynamicDialogCloseOptions<{ result: ConditionTerm }> | undefined,
    ) => {
      console.log('Add condition modal closed', options);
      const result = options?.data?.result;
      if (isNotNil(result)) {
        $emit(
          'update',
          modify('allOf', append<ConditionTerm>(result), $props.term),
        );
      }
    },
    props: {
      header: `Add Requirement`,
      modal: true,
      draggable: false,
      position: 'top',
    },
  });
};

const updateChild = (idx: number, term: ConditionTerm) => {
  $emit('update', modify('allOf', update(idx, term), $props.term));
};

const removeChild = (idx: number) => {
  $emit('update', modify('allOf', remove(idx, 1), $props.term));
};
</script>

<style scoped lang="scss"></style>
