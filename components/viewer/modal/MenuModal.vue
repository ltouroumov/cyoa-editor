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
        <div v-if="store.status === 'loaded'" class="mb-2">
          <div class="fw-bold">{{ store.file.projectName }}</div>
          <div class="font-monospace text-gray">
            Hash: {{ store.file.projectHash }}
          </div>
        </div>
        <ProjectMenu :project-list="viewerProjectList" />
      </div>
      <div v-if="selected === 'save-load'">
        <ImportCode />
        <hr />
        <ExportCode />
      </div>
      <div v-if="selected === 'library'">
        <BuildLibrary />
      </div>
    </template>
  </OffCanvas>
</template>

<script setup lang="ts">
import ProjectMenu from '~/components/viewer/ProjectMenu.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { toggleProjectMenu, viewerProjectList } = useViewerStore();
const { isProjectMenuVisible } = useViewerRefs();
const { store } = useProjectRefs();

const selected = ref<string>('project');
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

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

<style lang="scss">
.menu-modal {
  margin-top: 40px;
  width: 768px !important;
}

@media screen and (max-width: 768px) {
  .menu-modal {
    width: 100% !important;
    max-width: 100%;
  }
}
</style>
