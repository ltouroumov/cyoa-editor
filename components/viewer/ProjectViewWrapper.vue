<template>
  <ProjectView v-if="isNotNil($store.project)" :project="$store.project.data" />
  <div v-if="$store.store.status === 'loading'" class="loading-overlay">
    <div class="spinner-border text-primary me-2" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <strong>
      {{ !$store.store.progress ? 'Loading ...' : $store.store.progress }}
    </strong>
  </div>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import ProjectView from '~/components/viewer/ProjectView.vue';
import { useProjectStore } from '~/composables/store/project';

const $store = useProjectStore();
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
