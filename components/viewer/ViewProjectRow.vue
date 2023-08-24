<template>
  <div class="project-row" :class="{ hidden: !isVisible }">
    <div class="row-meta">
      <div class="row-title">{{ row.title }}</div>
      <img class="row-image" :src="row.image" v-if="row.image" :alt="row.title"/>
      <div class="row-text" v-if="row.titleText">{{ row.titleText }}</div>
    </div>
    <div class="container-fluid p-0">
      <div class="row g-2">
        <ViewProjectObj v-for="obj in row.objects" :obj="obj" :row="row"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProjectRow } from '~/composables/project';
import { buildConditions } from '~/composables/conditions';
import { useViewerStore } from '~/composables/store/viewer';
import { storeToRefs } from 'pinia';

const { row } = defineProps<{
  row: ProjectRow
}>();
const store = useViewerStore();
const { selected } = storeToRefs(store);

const condition = buildConditions(row);
const isVisible = ref<boolean>(condition(selected.value));

watch(selected, (newSelection) => {
  isVisible.value = condition(newSelection)
})
</script>

<style lang="scss">
.project-row {
  &.hidden {
    display: none;
  }

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