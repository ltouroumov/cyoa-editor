<template>
  <div class="project-row"
       v-if="checkConditions(row, selected)">
    <div class="row-meta">
      <div class="row-title">{{ row.title }}</div>
      <pre>{{ JSON.stringify(row.requireds) }}</pre>
      <img class="row-image" :src="row.image" v-if="row.image" :alt="row.title" />
      <div class="row-text" v-if="row.titleText">{{ row.titleText }}</div>
    </div>
    <div class="container-fluid p-0">
      <div class="row g-2">
        <ViewProjectObj v-for="obj in row.objects" :obj="obj" :row="row" :selected="selected" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ProjectRow} from "~/composables/project";
import {checkConditions} from "~/composables/conditions";
import {Ref} from "vue";

defineProps<{
  row: ProjectRow,
  selected: Ref<string[]>
}>()
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