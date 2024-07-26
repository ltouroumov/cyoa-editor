<template>
  <div v-if="project" class="text-light">
    <ViewMenuBar />
    <div class="project">
      <div class="rows">
        <ViewProjectRow
          v-for="row in project.data.rows"
          :key="row.id"
          :row="row"
        />
      </div>
    </div>
    <StyleProject :styles="project.data.styling" />
    <ViewBackpack />
    <ViewSearch />
    <ModalDialog :show="isProjectMenuVisible" @close="toggleProjectMenu(false)">
      <template #header>
        <h5 class="m-0">Project Menu</h5>
      </template>
      <template #default>
        <ViewProjectMenu :project-list="projectList" />
      </template>
    </ModalDialog>
  </div>
  <div v-else class="dialog-container">
    <ViewProjectMenu :project-list="projectList" />
  </div>
</template>

<script setup lang="ts">
import ViewBackpack from '~/components/viewer/modal/ViewBackpack.vue';
import ViewProjectMenu from '~/components/viewer/modal/ViewProjectMenu.vue';
import ViewSearch from '~/components/viewer/modal/ViewSearch.vue';
import StyleProject from '~/components/viewer/style/StyleProject.vue';
import ViewMenuBar from '~/components/viewer/ViewMenuBar.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { project } = useProjectRefs();
const { viewerProjectList } = useViewerRefs();

const projectList = computed(() => viewerProjectList.value);

const { toggleProjectMenu } = useViewerStore();
const { isProjectMenuVisible } = useViewerRefs();
</script>

<style lang="scss">
.project {
  font-family: sans-serif;
  padding: 0 1em;

  .rows {
    // Prevents collapsing margins
    display: flex;
    flex-direction: column;
  }
}

.dialog-container {
  min-height: 50vh;

  display: flex;
  justify-content: center;
  align-items: center;

  .dialog {
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
  }
}
</style>
