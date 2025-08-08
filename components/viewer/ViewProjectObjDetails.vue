<template>
  <div class="w-1/2 overflow-auto flex flex-row gap-2">
    <div class="project-obj-details w-2/3 relative pt-[120px]">
      <div class="obj-image-wrapper absolute top-0 left-0 right-0 z-0">
        <img
          v-if="obj.image"
          class="obj-image"
          :decoding="`sync`"
          :loading="`eager`"
          :src="obj.image"
          :href="objImageIsURL ? obj.image : ''"
          :alt="obj.title"
        />
      </div>
      <div class="flex flex-col gap-2 flex-auto z-10 relative">
        <div class="obj-header">
          <div class="obj-title">
            {{ obj.title }}
          </div>
          <template v-if="obj.isSelectableMultiple">
            <div class="obj-select-multi">
              <div
                v-if="canToggle"
                class="iconify carbon--subtract-alt text-xl"
                :class="{
                  'text-green-400': selectedAmount > minSelectedAmount,
                  'text-grey-400': selectedAmount <= minSelectedAmount,
                }"
                @click="decrement"
              />
              <span class="mx-1">{{ selectedAmount }}</span>
              <div
                v-if="canToggle"
                class="iconify carbon--add-alt text-xl"
                :class="{
                  'text-green-400': selectedAmount < maxSelectedAmount,
                  'text-grey-400': selectedAmount >= minSelectedAmount,
                }"
                @click="increment"
              />
            </div>
          </template>
          <ViewScores :scores="obj.scores" />
          <ViewRequirements :requireds="obj.requireds" />
        </div>
        <div ref="objContentRef" class="obj-content">
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="obj.text"
            class="obj-text"
            v-html="formatText(obj.text)"
          ></div>
          <!-- eslint-enable vue/no-v-html -->
          <ViewAddon
            v-for="(addon, idx) in obj.addons"
            :key="idx"
            :addon="addon"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 flex-auto">
      <span>TEST</span>
      <span>TEST</span>
      <span>TEST</span>
      <span>TEST</span>
      <span>TEST</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';

import ViewScores from '~/components/viewer/ViewScores.vue';
import { buildConditions } from '~/composables/conditions';
import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { formatText } from '~/composables/text';

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const $props = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
}>();

const condition = computed(() => buildConditions($props.obj));
const objImageIsURL = computed(() => {
  return R.match(/^https?:\/\//, $props.obj.image);
});

const isEnabled = computed<boolean>(() => {
  return condition.value(selectedIds.value);
});
const isSelected = computed<boolean>(() => {
  return R.has($props.obj.id, selected.value);
});
const canToggle = computed<boolean>(() => {
  return (
    isEnabled.value && !$props.obj.isNotSelectable && !$props.row.isInfoRow
  );
});

const selectedAmount = computed(() => {
  if ($props.obj.isSelectableMultiple)
    return selected.value[$props.obj.id] ?? 0;
  else return 0;
});

const minSelectedAmount = computed(() =>
  Number.parseInt($props.obj.numMultipleTimesMinus),
);
const maxSelectedAmount = computed(() =>
  Number.parseInt($props.obj.numMultipleTimesPluss),
);

const toggle = () => {
  if (canToggle.value && !$props.obj.isSelectableMultiple) {
    store.setSelected($props.obj.id, !isSelected.value);
  }
};

const increment = () => {
  if (canToggle.value) {
    store.incSelected($props.obj.id);
  }
};
const decrement = () => {
  if (canToggle.value) {
    store.decSelected($props.obj.id);
  }
};
</script>

<style scoped lang="scss"></style>
