<template>
  <div v-if="project" class="project">
    <ViewProjectRow v-for="row in project.rows" :row="row" :selected="selected" />
  </div>
  <div v-else class="dialog-container">
    <div class="dialog">
      <LoadProject />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {useProject} from "~/composables/project";

const project = useProject();
const selected = ref<string[]>([]);
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