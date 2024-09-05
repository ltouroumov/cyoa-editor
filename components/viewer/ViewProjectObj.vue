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

import ViewScores from '~/components/viewer/ViewScores.vue';
import { buildConditions } from '~/composables/conditions';
import { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { formatText } from '~/composables/text';

import StyleObj from './style/StyleObj.vue';

const {
  row,
  obj,
  preview = false,
  width = null,
  alwaysEnable = false,
  template = null,
} = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
  preview?: boolean;
  width?: string;
  alwaysEnable?: boolean;
  template?: string;
}>();

const objClass = computed(() => {
  if (preview) return ['obj-preview'];
  if (width) return ['col', { [width]: true }];

  let className = row.objectWidth;
  if (obj.objectWidth) {
    className = obj.objectWidth;
  }

  return ['col', { [className]: true }];
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
  // always enable when alwaysEnable prop is set to true
  // Used for the backpack, as objects should always be selectable when viewing the backpack
  if (alwaysEnable) return true;
  return condition.value(selectedIds.value);
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
  if (
    isEnabled.value &&
    !obj.isSelectableMultiple &&
    !obj.isNotSelectable &&
    !row.isInfoRow
  ) {
    store.setSelected(obj.id, !isSelected.value);
  }
};

const increment = () => {
  if (isEnabled.value) {
    store.incSelected(obj.id);
  }
};
const decrement = () => {
  if (isEnabled.value) {
    store.decSelected(obj.id);
  }
};
</script>

<style lang="scss">
.obj-preview {
  overflow: auto;
}
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
</style>
