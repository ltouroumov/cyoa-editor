<template>
  <div class="project-row" :class="{ hidden: !isVisible }">
    <div class="row-meta">
      <div class="row-title">{{ row.title }}</div>
      <img
        v-if="row.image"
        class="row-image"
        :src="row.image"
        :alt="row.title"
      />
      <div v-if="row.titleText" class="row-text">{{ row.titleText }}</div>
    </div>
    <div class="container-fluid p-0">
      <div class="row g-2">
        <ViewProjectObj
          v-for="obj in row.objects"
          :key="obj.id"
          :obj="obj"
          :row="row"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { ProjectRow } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';

const { row } = defineProps<{
  row: ProjectRow;
}>();

const { rowStatus } = useProjectRefs();

const isVisible = computed(() => rowStatus.value[row.id] ?? true);
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
