<template>
  <div v-if="project" class="project">
    <ViewProjectRow v-for="row in project.data.rows" :key="row.id" :row="row" />
    <ScoreBar />
  </div>
  <div v-else class="dialog-container">
    <div class="dialog">
      <LoadProject />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import ScoreBar from '~/components/viewer/ScoreBar.vue';
import { useProjectStore } from '~/composables/store/project';

const store = useProjectStore();
const { project } = storeToRefs(store);
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
