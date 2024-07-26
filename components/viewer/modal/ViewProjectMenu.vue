<template>
  <div class="dialog-container">
    <div class="dialog bg-dark-subtle text-light">
      <h5>Default Files</h5>
      <ul class="list-group mb-3">
        <li
          v-for="projects in projectList.items"
          :key="projects.title"
          class="list-group-item"
        >
          <a
            href="#"
            :data-fileurl="projects.remoteFileUrl"
            @click.prevent="loadRemoteFile"
          >
            {{ projects.title }}
          </a>
        </li>
      </ul>
      <div
        v-if="isLoading"
        class="d-flex align-items-center justify-content-start gap-3 mb-3"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <strong>Loading ...</strong>
      </div>

      <h5>Load File</h5>
      <LoadProject />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ViewerProjectList } from 'composables/viewer';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';

const isLoading = ref<boolean>(false);

const { projectList } = defineProps<{
  projectList: ViewerProjectList;
}>();

const { loadProject, unloadProject } = useProjectStore();
const { toggleProjectMenu } = useViewerStore();
const { isLoaded } = useProjectRefs();

const loadRemoteFile = async ({ target }: MouseEvent) => {
  if (target && target instanceof HTMLAnchorElement) {
    const fileURL = target.dataset.fileurl;
    if (!fileURL) return;
    isLoading.value = true;
    const result: any = await $fetch(fileURL, { parseResponse: JSON.parse });
    if (!isLoaded.value) {
      loadProject(result, fileURL);
    } else {
      unloadProject();
      // Wait for the unloadProject to finish before loading the new project
      nextTick(() => {
        if (!isLoaded.value) {
          loadProject(result, fileURL);
          toggleProjectMenu(false);
        }
      });
    }
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';
</style>
