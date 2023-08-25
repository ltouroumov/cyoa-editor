<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <div class="navbar-nav">
          <NuxtLink href="/editor" class="nav-link">Editor</NuxtLink>
          <NuxtLink href="/viewer" class="nav-link">Viewer</NuxtLink>
        </div>
        <span class="navbar-text">
          {{ project?.file ?? "No File Selected" }}
          <button class="btn btn-dark btn-sm i-carbon-close"
                  v-if="isLoaded"
                  @click="store.unloadProject">
          </button>
        </span>
      </div>
    </nav>
    <slot/>
  </div>
</template>
<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { storeToRefs } from 'pinia';

const store = useProjectStore();
const { project, isLoaded } = storeToRefs(store);
</script>

<style lang="scss">
</style>