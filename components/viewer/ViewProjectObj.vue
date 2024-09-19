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
        selected: isSelected,
        disabled: !isEnabled,
        notSelectable: obj.isNotSelectable || row.isInfoRow,
      }"
      @click="toggle"
    >
      <div class="project-obj-content" :class="objTemplateClass">
        <div class="obj-image-wrapper">
          <img
            v-if="obj.image"
            class="obj-image"
            loading="lazy"
            :src="obj.image"
            :alt="obj.title"
          />
        </div>
        <div class="obj-content">
          <div class="obj-title">
            {{ obj.title }}
          </div>
          <template v-if="obj.isSelectableMultiple">
            <div class="obj-select-multi">
              <div
                class="i-carbon-subtract-alt text-xl"
                :class="{
                  'text-green-400': selectedAmount > minSelectedAmount,
                  'text-grey-400': selectedAmount <= minSelectedAmount,
                }"
                @click="decrement"
              />
              <span class="mx-1">{{ selectedAmount }}</span>
              <div
                class="i-carbon-add-alt text-xl"
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
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="obj.text"
            class="obj-text"
            v-html="formatText(obj.text)"
          ></div>
          <!-- eslint-enable vue/no-v-html -->
        </div>
        <ViewAddon
          v-for="(addon, idx) in obj.addons"
          :key="idx"
          :addon="addon"
        />
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
import { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { formatText } from '~/composables/text';
import { ViewContext } from '~/composables/viewer';

const {
  row,
  obj,
  viewObject,
  width = null,
  forceWidth = null,
  template = null,
} = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
  viewObject?: ViewContext;
  width?: string;
  forceWidth?: string;
  template?: string;
}>();

const objClass = computed(() => {
  if (forceWidth) return ['col', { [forceWidth]: true }];

  let objectSize = row.objectWidth;
  if (obj.objectWidth) {
    objectSize = obj.objectWidth;
  }
  if (width) {
    objectSize = width;
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
  switch (template ?? obj.template) {
    case '1':
      return 'obj-template-top';
    case '2':
      return 'obj-template-left';
    case '3':
      return 'obj-template-right';
  }

  return 'obj-template-top';
});

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const condition = computed(() => buildConditions(obj));
const isEnabled = computed<boolean>(() => {
  // Whether the object is always enabled or disabled based on the viewObject
  // Otherwise check the object conditions
  switch (viewObject) {
    case ViewContext.BackpackEnabled:
      return true;
    default:
      return condition.value(selectedIds.value);
  }
});
const isSelectable = computed<boolean>(() => {
  return (
    isEnabled.value &&
    !obj.isNotSelectable &&
    !row.isInfoRow &&
    viewObject !== ViewContext.BackpackDisabled
  );
});
const isSelected = computed<boolean>(() => R.has(obj.id, selected.value));

const selectedAmount = computed(() => {
  if (obj.isSelectableMultiple) return selected.value[obj.id] ?? 0;
  else return 0;
});

const minSelectedAmount = computed(() =>
  Number.parseInt(obj.numMultipleTimesMinus),
);
const maxSelectedAmount = computed(() =>
  Number.parseInt(obj.numMultipleTimesPluss),
);

const toggle = () => {
  if (isSelectable.value && !obj.isSelectableMultiple) {
    store.setSelected(obj.id, !isSelected.value);
  }
};

const increment = () => {
  if (isSelectable.value) {
    store.incSelected(obj.id);
  }
};
const decrement = () => {
  if (isSelectable.value) {
    store.decSelected(obj.id);
  }
};
</script>

<style lang="scss">
.project-obj {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .project-obj-content {
    overflow: auto;

    &.obj-template-top {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas: 'image' 'text';
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

  &.notSelectable {
    border: none;
    border-radius: 0;
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

  .obj-content {
    overflow-x: auto;
    grid-area: text;

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
