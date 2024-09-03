<template>
  <OffCanvas
    :show="isProjectMenuVisible"
    position="left"
    :close-button="false"
    :header="false"
    class="menu-modal"
    @close="toggleProjectMenu(false)"
  >
    <template #header>
      <h5 class="m-0">Project Menu</h5>
    </template>
    <template #default>
      <ul class="nav nav-pills mb-3">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: selected === 'project' }"
            @click="selected = 'project'"
          >
            Project
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: selected === 'save-load' }"
            @click="selected = 'save-load'"
          >
            Save / Load
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: selected === 'library' }"
            @click="selected = 'library'"
          >
            Library
          </a>
        </li>
      </ul>
      <div v-if="selected === 'project'">
        <ProjectMenu :project-list="viewerProjectList" />
      </div>
      <div v-if="selected === 'save-load'">
        <ExportCode />
        <ImportCode />
      </div>
      <div v-if="selected === 'library'">
        <BuildLibrary />
      </div>
    </template>
  </OffCanvas>
</template>

<script setup lang="ts">
import ProjectMenu from '~/components/viewer/ProjectMenu.vue';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { toggleProjectMenu, viewerProjectList } = useViewerStore();
const { isProjectMenuVisible } = useViewerRefs();

const selected = ref<string>('project');
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

.menu-modal {
  margin-top: 40px;
  max-width: 50%;
  width: auto;
}

.pack-import-export {
  display: grid;
  gap: 0.5rem;
  grid-template:
    'head head' auto
    'in-txt out-txt' 1fr
    'in-btn out-btn' auto
    'list-txt list-txt' 2fr
    'list-tgl list-btn' auto
    / 1fr 1fr;

  strong {
    grid-area: head;
    display: block;
    text-align: center;
  }
  .import-code {
    grid-area: in-txt;
  }
  .export-code {
    grid-area: out-txt;
  }
  .export-text {
    grid-area: list-txt;
  }
  .import-btn {
    grid-area: in-btn;
  }
  .export-code-btn {
    grid-area: out-btn;
  }
  .export-text-btn {
    grid-area: list-btn;
  }
  .export-text-toggle {
    grid-area: list-tgl;
    justify-self: end;
    align-self: center;
  }
  .isCopied {
    color: white;
    background-color: green;
  }
}
</style>
