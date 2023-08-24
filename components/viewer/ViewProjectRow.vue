<template>
  <div class="project-row">
    <div class="row-meta">
      <div class="row-title">{{ row.title }}</div>
      <img class="row-image" :src="row.image" v-if="row.image" :alt="row.title" />
      <div class="row-text" v-if="row.titleText">{{ row.titleText }}</div>
    </div>
    <div class="container-fluid p-0">
      <div class="row g-2">
        <ViewProjectObj v-for="obj in row.objects" :obj="obj" :row="row" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ProjectRow} from "~/composables/project";

defineProps<{ row: ProjectRow }>()
</script>

<style lang="scss">
.project-row {
  .row-meta {
    display: flex;
    flex-direction: column;

    .row-title {
      padding: 5px 0;
      font-size: 1.5em;
      font-weight: bold;
    }

    .row-text {
      padding: 5px;
    }
  }
}
</style>