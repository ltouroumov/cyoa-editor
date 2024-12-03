<template>
  <div
    v-if="store.status !== 'loaded'"
    class="flex flex-col justify-stretch items-center py-5 h-[100%]"
  >
    <ProjectLibrary class="grow w-[80%]" />
  </div>
  <div v-if="isNotNil(project)" class="container-fluid">
    <div class="row p-1">
      <Menubar />
    </div>
    Project Loaded
  </div>
  <DynamicDialog />
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import { useProjectRefs } from '~/composables/store/project';

const { store, project } = useProjectRefs();
</script>

<style>
@import '~/assets/css/bootstrap/grid.scss';

body {
  background: var(--p-stone-700);
  width: 100vw;
  height: 100vh;
}
</style>
