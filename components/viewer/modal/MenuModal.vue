<template>
  <ModalDialog :show="isProjectMenuVisible" @close="toggleProjectMenu(false)">
    <template #header>
      <h5 class="m-0">Project Menu</h5>
    </template>
    <template #default>
      <div>
        <ProjectMenu :project-list="viewerProjectList" />
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ProjectMenu from '~/components/viewer/ProjectMenu.vue';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { toggleProjectMenu, viewerProjectList } = useViewerStore();
const { isProjectMenuVisible } = useViewerRefs();
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';
</style>
