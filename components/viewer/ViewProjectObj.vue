<template>
  <div :class="objClass">
    <div
      class="project-obj"
      :class="{ selected: isSelected, disabled: !isEnabled }"
      @click="toggle"
    >
      <div class="project-obj-content">
        <img
          v-if="obj.image"
          class="obj-image"
          :src="obj.image"
          :alt="obj.title"
        />
        <div class="obj-content">
          <div class="obj-title">
            <span class="obj-title-text">{{ obj.title }}</span>
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
          <div class="obj-text" v-html="formatText(obj.text)"></div>
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

const {
  row,
  obj,
  preview = false,
  width = null,
} = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
  preview?: boolean;
  width?: string;
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

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const condition = computed(() => buildConditions(obj));
const isEnabled = computed<boolean>(() => condition.value(selectedIds.value));
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
  if (isEnabled.value && !obj.isSelectableMultiple) {
    if (obj.activateOtherChoice) {
      R.split(',', obj.activateThisChoice).forEach((id) => {
        store.setSelected(id, !isSelected.value);
      });
    }

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
@import '~/assets/css/bootstrap/_config.scss';

.obj-preview {
  overflow: auto;
}

.project-obj {
  height: 100%;
  border: 1px solid white;
  border-radius: 1em;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  .project-obj-content {
    overflow: auto;
  }

  &.selected {
    background-color: #193c78ff;
  }

  &.disabled {
    background-color: gray;
  }

  .obj-image {
    width: 100%;
    aspect-ratio: 5/3;
  }

  .obj-content {
    padding: 0.5em;
    overflow-x: auto;

    .obj-title {
      font-size: 1.2em;
      font-weight: bolder;
      margin-bottom: 5px;
      text-align: center;
    }

    .obj-select-multi {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      margin-bottom: 5px;
    }

    .obj-text {
      text-align: center;
    }
  }
}
</style>
