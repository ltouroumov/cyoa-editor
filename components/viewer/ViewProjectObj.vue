<template>
  <div class="col" :class="objClass(row, obj)">
    <div
      class="project-obj"
      :class="{ selected: isSelected, disabled: !isEnabled }"
      @click="toggle"
    >
      <img
        v-if="obj.image"
        class="obj-image"
        :src="obj.image"
        :alt="obj.title"
      />
      <div class="obj-content">
        <div class="obj-title">
          <template v-if="obj.isSelectableMultiple">
            <div class="d-flex flex-row align-items-center obj-title-icon">
              <div
                class="i-carbon-subtract-alt"
                :class="{
                  'text-green-400': selectedAmount > minSelectedAmount,
                  'text-grey-400': selectedAmount <= minSelectedAmount,
                }"
                @click="decrement"
              />
              <span class="mx-1">{{ selectedAmount }}</span>
              <div
                class="i-carbon-add-alt"
                :class="{
                  'text-green-400': selectedAmount < maxSelectedAmount,
                  'text-grey-400': selectedAmount >= minSelectedAmount,
                }"
                @click="increment"
              />
            </div>
          </template>
          <template v-else>
            <div
              v-if="isSelected"
              class="i-carbon-checkmark text-green-400 obj-title-icon"
            />
          </template>
          <span class="obj-title-text">{{ obj.title }}</span>
          <span class="obj-title-id">({{ obj.id }})</span>
        </div>
        <ViewScores :scores="obj.scores" />
        <ViewRequirements :requireds="obj.requireds" />
        <div class="obj-text" v-html="formatText(obj.text)"></div>
      </div>
      <ViewAddon v-for="(addon, idx) in obj.addons" :key="idx" :addon="addon" />
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

const { row, obj } = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
}>();

const objClass = (row: ProjectRow, obj: ProjectObj) => {
  let className = row.objectWidth;
  if (obj.objectWidth) className = obj.objectWidth;

  return { [className]: true };
};

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const condition = buildConditions(obj);
const isEnabled = computed<boolean>(() => condition(selectedIds.value));
const isSelected = computed<boolean>(() => R.has(obj.id, selected.value));

const selectedAmount = computed(() => {
  if (obj.isSelectableMultiple) return selected.value[obj.id] ?? 0;
  else return 0;
});

const minSelectedAmount = Number.parseInt(obj.numMultipleTimesMinus);
const maxSelectedAmount = Number.parseInt(obj.numMultipleTimesPluss);

const toggle = () => {
  if (isEnabled.value && !obj.isSelectableMultiple) {
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
.project-obj {
  height: 100%;
  border: 2px solid white;
  border-radius: 1em;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  &.selected {
    background-color: #193c78ff;
  }

  &.disabled {
    background-color: gray;
  }

  .obj-image {
    margin-bottom: 5px;
    width: 100%;
  }

  .obj-content {
    padding: 0.5em;

    .obj-title {
      font-size: 1.2em;
      font-weight: bolder;
      margin-bottom: 5px;

      display: grid;
      grid-template-columns: 1fr max-content 1fr;
      grid-template-rows: auto;

      .obj-title-icon {
        grid-column: 1 / span 1;
        justify-self: left;
      }

      .obj-title-text {
        grid-column: 2 / span 1;
        justify-self: center;
      }

      .obj-title-id {
        grid-column: 3 / span 1;
        justify-self: right;
        font-size: 0.7em;
        color: gray;
      }
    }
  }
}
</style>
