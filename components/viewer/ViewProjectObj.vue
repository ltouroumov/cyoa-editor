<template>
  <div :id="`obj-${obj.id}`" :class="objClass">
    <StyleObj
      v-if="obj.isPrivateStyling"
      :styles="obj.styling"
      :obj-id="obj.id"
    />
    <div
      class="project-obj"
      :class="{
        selected: isSelected && !isInBackpack,
        disabled: !isEnabled,
        notSelectable: obj.isNotSelectable || row.isInfoRow,
        canToggle: canToggle,
        hideDisabledAddons: $props.display?.hideDisabledAddons,
        hasPrivateStyling: obj.isPrivateStyling,
      }"
      @click="toggle"
    >
      <div class="project-obj-content" :class="objTemplateClass">
        <div class="obj-image-wrapper">
          <img
            v-if="obj.image && !display?.hideObjectImages"
            class="obj-image"
            :decoding="alwaysEnable ? `sync` : `auto`"
            :loading="alwaysEnable ? `eager` : `lazy`"
            :src="obj.image"
            :href="objImageIsURL ? obj.image : ''"
            :alt="obj.title"
          />
        </div>
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
          <ViewScores v-if="!display?.hideObjectScores" :scores="obj.scores" />
          <ViewRequirements
            v-if="!display?.hideObjectRequirements"
            :requireds="obj.requireds"
          />
        </div>
        <div class="obj-content">
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="obj.text && !display?.hideObjectText"
            class="obj-text"
            v-html="formatText(obj.text)"
          ></div>
          <!-- eslint-enable vue/no-v-html -->
          <ViewAddon
            v-for="(addon, idx) in obj.addons"
            :key="idx"
            :addon="addon"
            :display="display"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';

import StyleObj from './style/StyleObj.vue';

import { ObjectSizes } from '~/components/viewer/style/sizes';
import ViewScores from '~/components/viewer/ViewScores.vue';
import { buildConditions } from '~/composables/conditions';
import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';
import { formatText } from '~/composables/text';
import { ViewContext } from '~/composables/viewer';

const $props = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
  viewObject?: ViewContext;
  width?: string;
  forceWidth?: string;
  template?: string;
  display?: DisplaySettings;
}>();

const objClass = computed(() => {
  if ($props.forceWidth) return ['col', { [$props.forceWidth]: true }];

  let objectSize = $props.row.objectWidth;
  if ($props.obj.objectWidth) {
    objectSize = $props.obj.objectWidth;
  }
  if ($props.width) {
    objectSize = $props.width;
  }

  if (objectSize in ObjectSizes) {
    const classes = ObjectSizes[objectSize];
    return ['col', 'col-12', ...classes];
  } else {
    console.log(`Missing size reducer for ${objectSize}`);
    return ['col', 'col-12', objectSize];
  }
});

const objTemplateClass = computed(() => {
  // Allow to override the template
  // Used in the search results since the object view is always single-column
  switch ($props.template ?? $props.obj.template) {
    case '1':
      return 'obj-template-top';
    case '2':
      return 'obj-template-left';
    case '3':
      return 'obj-template-right';
  }

  return 'obj-template-top';
});

const objImageIsURL = computed(() => {
  return R.match(/^https?:\/\//, $props.obj.image);
});

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const condition = computed(() => buildConditions($props.obj));
const isEnabled = computed<boolean>(() => {
  // Whether the object is always enabled or disabled based on the viewObject
  // Otherwise check the object conditions
  switch ($props.viewObject) {
    case ViewContext.BackpackEnabled:
    case ViewContext.BackpackDisabled:
      return true;
    default:
      return condition.value(selectedIds.value);
  }
});
const alwaysEnable = computed<boolean>(() => {
  switch ($props.viewObject) {
    case ViewContext.BackpackEnabled:
    case ViewContext.BackpackDisabled:
      return true;
    default:
      return false;
  }
});
const canToggle = computed<boolean>(() => {
  return (
    isEnabled.value &&
    !$props.obj.isNotSelectable &&
    !$props.row.isInfoRow &&
    $props.viewObject !== ViewContext.BackpackDisabled
  );
});
const isInBackpack = computed<boolean>(() => {
  return (
    $props.viewObject === ViewContext.BackpackEnabled ||
    $props.viewObject === ViewContext.BackpackDisabled
  );
});
const isSelected = computed<boolean>(() => {
  return R.has($props.obj.id, selected.value);
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

<style lang="scss">
.project-obj {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.hideDisabledAddons {
    .addon.disabled {
      display: none;
    }
  }

  .project-obj-content {
    overflow: auto;
    max-height: 1000px;
    position: relative;

    &.obj-template-top {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      grid-template-areas: 'image' 'header' 'content';
    }
    &.obj-template-left {
      display: grid;
      grid-template-columns: 1fr 2fr;
      grid-template-rows: 1fr;
      grid-template-areas: 'image text';
    }
    &.obj-template-right {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: 'text image';
    }
  }

  .obj-image-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;

    grid-area: image;
  }
  .obj-image {
    width: 100%;
    object-fit: contain;
  }

  .obj-header {
    grid-area: header;
    position: sticky;
    top: 0;
    z-index: 10;

    .obj-title {
      margin-bottom: 5px;
    }

    .obj-select-multi {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }
  .obj-content {
    overflow-x: auto;
    overflow-y: hidden;
    grid-area: content;
    column-width: 10000px;
    column-rule-width: 0;
  }
}

@media screen and (min-width: 768px) {
  $widths: (
    20: 20%,
    14: 14%,
    12: 12%,
    11: 11%,
    10: 10%,
    9: 9%,
  );

  @each $width, $size in $widths {
    .w-md-#{$width} {
      flex: 0 0 $size !important;
      max-width: $size !important;
    }
  }
}
</style>
