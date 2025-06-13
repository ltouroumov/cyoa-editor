<template>
  <DataView :value="projectList.items" data-key="id">
    <template #list="{ items }">
      <div class="flex flex-col">
        <div v-for="(item, index) in items" :key="item.id">
          <div
            class="flex flex-row gap-3 py-2 cursor-pointer"
            :class="{
              'border-t border-surface-200 dark:border-surface-700':
                index !== 0,
            }"
            @click="loadRemoteFile(item)"
          >
            <div>
              <Skeleton
                v-if="!item.preview"
                width="5rem"
                height="3rem"
                animation="none"
              />
              <div
                v-if="item.preview"
                class="w-[5rem] h-[3rem] rounded overflow-auto"
              >
                <Image :src="item.preview" />
              </div>
            </div>
            <div>
              <h2 class="font-bold text-xl text-primary">{{ item.title }}</h2>
              <div v-if="item.author" class="italic text-slate-500">
                {{ item.author }}
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { bufferToString } from '~/composables/utils';
import { sleep } from '~/composables/utils/sleep';
import type { ViewerProjectList } from '~/composables/viewer';

const { projectList } = defineProps<{
  projectList: ViewerProjectList;
}>();

const { loadProject } = useProjectStore();
const { toggleProjectMenu } = useViewerStore();

const loadRemoteFile = async (project: ViewerProject) => {
  const fileURL = project.file_url;
  if (!fileURL) return;

  toggleProjectMenu(false);
  await loadProject(async (setProgress) => {
    await setProgress(`Loading ${project.title} ...`);

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

      await setProgress(`Loading ${project.title} ...`);
      // A hack, but otherwise the progress value never updates before loadProject is called
      await sleep(100);

      const bodyBytes = new Uint8Array(received);
      let pos = 0;
      for (const chunk of chunks) {
        bodyBytes.set(chunk, pos);
        pos += chunk.length;
      }

      return {
        fileContents: bufferToString(bodyBytes.buffer),
        fileName: fileURL.toString(),
      };
    } else {
      throw new Error(
        `HTTP Request failed with ${response.status}: ${response.statusText}`,
      );
    }
  });
};
</script>

<style scoped lang="scss"></style>
