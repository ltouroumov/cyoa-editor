<template>
  <div class="col" :class="objClass(row, obj)">
    <div class="project-obj">
      <img class="obj-image" :src="obj.image" v-if="obj.image" :alt="obj.title"/>
      <div class="obj-content">
        <div class="obj-title">{{ obj.title }}</div>
        <div class="obj-text" v-html="formatText(obj.text)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ProjectObj, ProjectRow} from "~/composables/project";
import {formatText} from "~/composables/text";

defineProps<{ row: ProjectRow, obj: ProjectObj }>()

const objClass = (row: ProjectRow, obj: ProjectObj) => {
  let className = row.objectWidth;
  if (obj.objectWidth)
    className = obj.objectWidth;

  return { [className]: true };
};
</script>

<style lang="scss">
.project-obj {
  height: 100%;
  border: 1px solid white;
  border-radius: 5px;

  display: flex;
  flex-direction: column;

  .obj-image {
    margin-bottom: 5px;
    width: 100%;
  }

  .obj-content {
    padding: 5px;

    .obj-title {
      font-size: 1.2em;
      margin-bottom: 5px;
    }
  }
}
</style>