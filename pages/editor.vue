<template>
  <div class="container-fluid">
    <div v-if="store.status !== 'loaded'" class="row justify-content-center">
      <ProjectLibrary />
    </div>
    <template v-if="isNotNil(project)">
      <div class="row p-1">
        <Menubar />
      </div>
      Project Loaded
    </template>
  </div>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import { useProjectRefs } from '~/composables/store/project';

const { store, project } = useProjectRefs();
</script>

<style></style>
