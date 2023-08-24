<template>
  <div class="col"
       :class="objClass(row, obj)">
    <div class="project-obj"
         :class="{ selected: isSelected }"
         @click="toggle">
      <img class="obj-image" :src="obj.image" v-if="obj.image" :alt="obj.title"/>
      <div class="obj-content">
        <div class="obj-title">
          <div class="i-carbon-checkmark text-green-400 obj-title-icon" v-if="isSelected"></div>
          <span class="obj-title-text">{{ obj.title }}</span>
          <span class="obj-title-id">({{ obj.id }})</span>
        </div>
        <ViewScores :obj="obj"/>
        <ViewRequirements :obj="obj"/>
        <div class="obj-text" v-html="formatText(obj.text)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProjectObj, ProjectRow } from '~/composables/project';
import { formatText } from '~/composables/text';
import * as R from 'ramda';
import { useViewerStore } from '~/composables/store/viewer';
import { buildConditions } from '~/composables/conditions';
import { storeToRefs } from 'pinia';
import ViewScores from '~/components/viewer/ViewScores.vue';

const { row, obj } = defineProps<{
  row: ProjectRow,
  obj: ProjectObj
}>()

const objClass = (row: ProjectRow, obj: ProjectObj) => {
  let className = row.objectWidth;
  if (obj.objectWidth)
    className = obj.objectWidth;

  return { [className]: true };
};

const toggle = () => {
  isSelected.value = !isSelected.value;
}

const store = useViewerStore();
const { selected } = storeToRefs(store);

const condition = buildConditions(row);
const isVisible = ref<boolean>(condition(selected.value));
const isSelected = ref<boolean>(R.includes(obj.id, selected.value));
watch(selected, (newSelection) => {
  isVisible.value = condition(newSelection)
})
watch(isSelected, (newIsSelected) => {
  store.setSelected(obj.id, newIsSelected);
})
</script>

<style lang="scss">
.project-obj {
  height: 100%;
  border: 1px solid white;
  border-radius: 5px;

  display: flex;
  flex-direction: column;

  &.selected {
    background-color: #193C78FF;
  }

  .obj-image {
    margin-bottom: 5px;
    width: 100%;
  }

  .obj-content {
    padding: 5px;

    .obj-title {
      font-size: 1.2em;
      margin-bottom: 5px;

      display: grid;
      grid-template-columns: 50px 1fr 50px;
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