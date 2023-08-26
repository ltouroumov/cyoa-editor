<template>
  <div data-bs-theme="dark">
    <nav class="navbar navbar-expand-lg bg-dark-subtle navbar-dark">
      <div class="container-fluid">
        <div class="navbar-nav">
          <NuxtLink href="/editor" class="nav-link">Editor</NuxtLink>
          <NuxtLink href="/viewer" class="nav-link">Viewer</NuxtLink>
        </div>
        <span class="navbar-text">
          {{ project?.file ?? 'No File Selected' }}
          <button
            v-if="isLoaded"
            class="btn btn-dark btn-sm i-carbon-close"
            @click="store.unloadProject"
          ></button>
        </span>
      </div>
    </nav>
    <slot />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useProjectStore } from '~/composables/store/project';

const store = useProjectStore();
const { project, isLoaded } = storeToRefs(store);
</script>

<style lang="scss"></style>
