<template>
  <Drawer
    v-model:visible="isProjectMenuVisible"
    position="left"
    class="menu-modal"
    :block-scroll="true"
    :dt="{ border: { color: null } }"
  >
    <template #container="{ closeCallback }">
      <div class="p-4 flex flex-row border-b border-surface-700">
        <h1 class="text-primary text-2xl flex-1">
          {{ store.status === 'loaded' ? store.file.projectName : '' }}
        </h1>
        <Button
          icon="pi pi-times"
          rounded
          variant="outlined"
          severity="secondary"
          size="small"
          @click="closeCallback()"
        />
      </div>
      <div class="p-4 overflow-y-auto">
        <Tabs value="save-load" :dt="{ tabpanel: { padding: '1rem 0 0 0' } }">
          <TabList>
            <Tab v-if="viewerProjectList.show_project_sidebar" value="project">
              Index
            </Tab>
            <Tab value="save-load">Save / Load</Tab>
            <Tab value="library">Library</Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>
          <TabPanels>
            <TabPanel
              v-if="viewerProjectList.show_project_sidebar"
              value="project"
            >
              <div v-if="store.status === 'loaded'" class="mb-2">
                <div class="fw-bold">{{ store.file.projectName }}</div>
                <div class="font-monospace text-gray">
                  Hash: {{ store.file.projectHash }}
                </div>
              </div>
              <ProjectMenu :project-list="viewerProjectList" :compact="true" />
            </TabPanel>
            <TabPanel value="save-load">
              <ImportCode />
              <div class="my-2 border-t border-surface-700"></div>
              <ExportCode />
              <div class="my-2 border-t border-surface-700"></div>
              <ExportText />
            </TabPanel>

            <TabPanel value="library">
              <BuildLibrary />
            </TabPanel>
            <TabPanel value="settings">
              <ViewerSettings />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import ProjectMenu from '~/components/viewer/ProjectMenu.vue';
import ViewerSettings from '~/components/viewer/utils/ViewerSettings.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { toggleProjectMenu, viewerProjectList } = useViewerStore();
const { isProjectMenuVisible } = useViewerRefs();
const { store } = useProjectRefs();

const selected = ref<string>('save-load');
</script>

<style lang="scss">
.menu-modal {
  width: 768px !important;
}

@media screen and (max-width: 768px) {
  .menu-modal {
    width: 100% !important;
    max-width: 100%;
  }
}
</style>
