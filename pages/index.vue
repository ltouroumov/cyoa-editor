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
    <BackpackModal />
    <SearchModal />
    <MenuModal />
  </div>
  <div v-else class="dialog-container">
    <div class="bg-dark-subtle dialog text-light">
      <ProjectMenu :project-list="projectList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BackpackModal from '~/components/viewer/modal/BackpackModal.vue';
import MenuModal from '~/components/viewer/modal/MenuModal.vue';
import SearchModal from '~/components/viewer/modal/SearchModal.vue';
import ProjectMenu from '~/components/viewer/ProjectMenu.vue';
import StyleProject from '~/components/viewer/style/StyleProject.vue';
import ViewMenuBar from '~/components/viewer/ViewMenuBar.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs } from '~/composables/store/viewer';

const { project } = useProjectRefs();
const { viewerProjectList } = useViewerRefs();

const projectList = computed(() => viewerProjectList.value);
</script>

<style lang="scss">
@import '~/assets/css/bootstrap/config';

html {
  font-size: 16px;
}

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
  margin-top: 5em;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .dialog {
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
  }
}
</style>
