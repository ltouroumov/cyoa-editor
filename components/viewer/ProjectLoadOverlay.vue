<template>
  <div v-if="store.status === 'loading'" class="loading-overlay">
    <div class="loading-progress">
      <ProgressSpinner class="size-8" />
      <strong v-if="store.progress" class="font-bold">
        {{ store.progress }}
      </strong>
    </div>
    <div class="loading-background">
      <img
        v-if="R.isNotNil(background)"
        :src="background"
        alt="Background ..."
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { isEmpty, isNotNil, map, reverse, sortBy, sum } from 'ramda';

import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useSettingRefs, useSettingStore } from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';
import { sleep } from '~/composables/utils/sleep';

const { store } = useProjectRefs();
const config = useRuntimeConfig();
const { viewerProjectList } = useViewerRefs();
const { loadProject } = useProjectStore();
const { hasPreference } = useSettingStore();
const { loadProjectOnStartup } = useSettingRefs();

type BackgroundImageData = {
  url: string;
  weight?: number;
};
type BackgroundData = {
  enabled: boolean;
  images: BackgroundImageData[];
};

const _config = useRuntimeConfig();
const { data: backgroundConfig } = await useAsyncData(
  'backgrounds',
  (): Promise<BackgroundData> =>
    fetch(`${_config.app.baseURL}config/viewer/backgrounds.json`).then(
      (response) => response.json(),
    ),
);

const background = ref<string | null>(null);

const randomizeBackground = () => {
  const bgConf = backgroundConfig.value;
  if (!bgConf) return;

  if (bgConf.enabled && !isEmpty(bgConf.images)) {
    // Sort the images by weight, from highest to lowest
    const images = reverse(sortBy((img) => img.weight ?? 1, bgConf.images));
    // Calculate the total weight of all images
    const totalWeight: number = sum(map((img) => img.weight ?? 1, images));
    // Generate a random number between 0 and the total weight (rounded to the nearest integer)
    const diceRoll = Math.round(Math.random() * totalWeight);

    // Loop through the images until the dice roll is less than the running total of weights.
    //
    // **Example**
    // 01.png has a weight of 10, 02.png has a weight of 2,
    // 03.png has a weight of 1, and the total weight is 13.
    // If the dice roll is 10 or lower, the background will be 01.png.
    // If the dice roll is 11 or 12, the background will be 03.png.
    // If the dice roll is 13, the background will be 02.png.
    let acc = 0;
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      acc += img.weight ?? 1;

      if (diceRoll <= acc) {
        background.value = `${config.app.baseURL}${img.url}`;
        return;
      }
    }

    // Pick the image with the highest weight as a fallback
    background.value = `${config.app.baseURL}${images[0].url}`;
  }
};

randomizeBackground();
useIntervalFn(randomizeBackground, 5000);

const getProjectData = (projectId: string): ViewerProject | undefined => {
  return R.find(R.propEq(projectId, 'id'), viewerProjectList.value.items);
};

onMounted(async () => {
  let shouldLoadProject = false;
  let project: ViewerProject | null = null;

  if (
    hasPreference() &&
    loadProjectOnStartup.value &&
    store.value.status === 'empty'
  ) {
    shouldLoadProject = true;
    project = getProjectData(loadProjectOnStartup.value)!;
  }

  if (isNotNil(viewerProjectList.value.default)) {
    shouldLoadProject = true;
    project = getProjectData(viewerProjectList.value.default)!;
  }

  if (shouldLoadProject && project) {
    await loadProject(async (setProgress) => {
      const response = await fetch(project.file_url);
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

        await setProgress(`Loading ${project.title}...`);
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
          fileName: project.file_url.toString(),
        };
      } else {
        throw new Error(
          `HTTP Request failed with ${response.status}: ${response.statusText}`,
        );
      }
    });
  }
});
</script>

<style scoped lang="scss">
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  display: grid;

  .loading-progress {
    grid-area: 1 / 1;
    justify-self: center;
    align-self: start;
    margin-top: 2.5rem;

    z-index: 100;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 1rem;
  }

  .loading-background {
    grid-area: 1 / 1;

    z-index: 50;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }
}
</style>
