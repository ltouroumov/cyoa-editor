<template>
  <div>
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
      <strong>{{ !progress ? 'Loading ...' : progress }}</strong>
    </div>
  </div>
  <div>
    <h5>Load File</h5>
    <LoadProject />
  </div>
</template>

<script setup lang="ts">
import { ViewerProjectList } from 'composables/viewer';
import { Project } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';

const isLoading = ref<boolean>(false);
const progress = ref<string | null>(null);

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

    const response = await fetch(fileURL);

    let result: Project;
    if (response.ok) {
      const reader = response.body!.getReader();

      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        received += value.length;

        await nextTick(() => {
          const receivedMB = received / (1024 * 1024);
          const neat = Math.round(receivedMB * 100) / 100;
          progress.value = `Downloaded ${neat} Mb`;
        });
      }

      const bodyBytes = new Uint8Array(received);
      let pos = 0;
      for (const chunk of chunks) {
        bodyBytes.set(chunk, pos);
        pos += chunk.length;
      }

      const bodyText = new TextDecoder('utf-8').decode(bodyBytes);
      result = JSON.parse(bodyText);
    } else {
      return;
    }

    if (isLoaded.value) {
      unloadProject();
    }
    // Wait for the unloadProject to finish before loading the new project
    await nextTick(() => {
      loadProject(result, fileURL);
      toggleProjectMenu(false);
      isLoading.value = false;
    });
  }
};
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';
</style>
