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
  </div>
  <div v-if="projectList.show_load_file">
    <h5>Load File</h5>
    <LoadProject />
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { bufferToString, sleep } from '~/composables/utils';
import type { ViewerProjectList } from '~/composables/viewer';

const { projectList } = defineProps<{
  projectList: ViewerProjectList;
}>();

const { loadProject } = useProjectStore();
const { toggleProjectMenu } = useViewerStore();

const loadRemoteFile = async ({ target }: MouseEvent) => {
  if (target && target instanceof HTMLAnchorElement) {
    const fileURL = target.dataset.fileurl;
    if (!fileURL) return;

    toggleProjectMenu(false);
    await loadProject(async (setProgress) => {
      const response = await fetch(fileURL);
      if (response.ok) {
        const reader = response.body!.getReader();

        let received = 0;
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          received += value.length;

          const receivedMB = received / (1024 * 1024);
          const neat = Math.round(receivedMB * 100) / 100;
          await setProgress(`Downloaded ${neat} Mb`);
        }

        await setProgress(`Loading ${target.text}...`);
        // A hack, but otherwise the progress value never updates before loadProject is called
        await sleep(100);

        const bodyBytes = new Uint8Array(received);
        let pos = 0;
        for (const chunk of chunks) {
          bodyBytes.set(chunk, pos);
          pos += chunk.length;
        }

        return {
          fileContents: bufferToString(bodyBytes),
          fileName: fileURL.toString(),
        };
      } else {
        throw new Error(
          `HTTP Request failed with ${response.status}: ${response.statusText}`,
        );
      }
    });
  }
};
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';
</style>
