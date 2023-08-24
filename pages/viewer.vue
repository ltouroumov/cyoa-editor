<template>
  <div v-if="project" class="project">
    <ViewProjectRow v-for="row in project.rows" :row="row" />
  </div>
  <div v-else class="dialog-container">
    <div class="dialog">
      <LoadProject />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ProjectObj, ProjectRow, useProject} from "~/composables/project";

const project = useProject();

const objClass = (row: ProjectRow, obj: ProjectObj) => {
  let className = row.objectWidth;
  if (obj.objectWidth)
    className = obj.objectWidth;

  return { [className]: true };
};

const formatText = (text: string) =>
    text.replaceAll('\n', '<br/>')
</script>

<style lang="scss">
.project {
  background: black;
  color: white;

  font-family: sans-serif;
  padding: 0 1em;
}

.dialog-container {
  min-height: 50vh;

  display: flex;
  justify-content: center;
  align-items: center;

  .dialog {
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
  }
}
</style>