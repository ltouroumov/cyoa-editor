<template>
  <div class="project-obj-details w-1/2 overflow-auto flex flex-row relative">
    <div class="obj-image-wrapper absolute top-0 left-0 right-0 z-0">
      <img
        v-if="obj.image"
        class="obj-image w-full"
        :decoding="`sync`"
        :loading="`eager`"
        :src="obj.image"
        :href="objImageIsURL ? obj.image : ''"
        :alt="obj.title"
      />
    </div>
    <div class="overflow-auto w-2/3 relative">
      <div
        class="obj-details-contents flex flex-col gap-2 flex-auto z-10 relative pt-[120px]"
      >
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
    <div
      class="obj-details-controls flex flex-col gap-2 flex-auto relative z-10 p-2 pt-[120px]"
    >
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

<style scoped lang="scss">
.project-obj-details {
  background-color: var(--obj-bg-color);
  border: var(--obj-border);
  border-radius: var(--obj-border-radius);
}

.obj-details-controls {
  //background-color: var(--obj-bg-color);
  background: linear-gradient(
    180deg,
    rgba(from var(--obj-bg-color) r g b / 0%) 0px,
    rgba(from var(--obj-bg-color) r g b / 0%) 120px,
    rgba(from var(--obj-bg-color) r g b / 100%) 240px,
    var(--obj-bg-color) 100%
  );
}

.obj-details-contents {
  //background-color: var(--obj-bg-color);
  background: linear-gradient(
    180deg,
    rgba(from var(--obj-bg-color) r g b / 0%) 0px,
    rgba(from var(--obj-bg-color) r g b / 0%) 120px,
    rgba(from var(--obj-bg-color) r g b / 100%) 240px,
    var(--obj-bg-color) 100%
  );

  .obj-title {
    font-family: var(--obj-title-font) sans-serif;
    font-size: var(--obj-title-size);
    color: var(--obj-title-color);
    text-align: var(--obj-title-align);
  }
  .obj-text {
    font-family: var(--obj-text-font) sans-serif;
    text-align: var(--obj-text-align);
    color: var(--obj-text-color);
    padding: var(--obj-text-padding);
    font-size: var(--obj-text-size);
  }

  .obj-score,
  .obj-requirements {
    font-family: var(--obj-score-font) sans-serif;
    font-size: var(--obj-score-size);
    text-align: var(--obj-score-align);
    color: var(--obj-score-color);
  }

  &.selected {
    background-color: var(--obj-selected-bg-color);
    filter: var(--obj-selected-filter);
  }
  &.disabled {
    background-color: var(--obj-disabled-bg-color);
    filter: var(--obj-disabled-filter);
  }

  :deep(.addon) {
    .title {
      font-family: var(--obj-addon-title-font) sans-serif;
      font-size: var(--obj-addon-title-size);
      color: var(--obj-addon-title-color);
      text-align: var(--obj-addon-title-align);
    }

    .text {
      font-family: var(--obj-addon-text-font) sans-serif;
      font-size: var(--obj-addon-text-size);
      color: var(--obj-addon-text-color);
      text-align: var(--obj-addon-text-align);
      padding: var(--obj-text-padding);
    }

    &.disabled {
      background-color: var(--obj-addon-disabled-bg-color);
      filter: var(--obj-addon-disabled-filter);
    }
  }
}
</style>
