<template>
  <div v-if="store.status === 'loading'" class="loading-overlay">
    <div class="loading-progress">
      <div class="spinner-border text-primary me-2" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <strong>
        {{ !store.progress ? 'Loading ...' : store.progress }}
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

import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useSettingRefs, useSettingStore } from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';

const { store } = useProjectRefs();
const config = useRuntimeConfig();
const { viewerProjectList } = useViewerRefs();
const { loadProject } = useProjectStore();
const { hasPreference } = useSettingStore();
const { cyoaPreference } = useSettingRefs();

const background = ref<string | null>(null);
const BACKGROUNDS = [
  { url: 'bgs/load-01.jpg' },
  { url: 'bgs/load-02.jpg' },
  { url: 'bgs/load-04.jpg' },
  { url: 'bgs/load-05.png' },
  { url: 'bgs/load-06.jpg' },
  { url: 'bgs/load-07.webp' },
  { url: 'bgs/load-08.jpg' },
  { url: 'bgs/load-09.jpg' },
];

const randomizeBackground = () => {
  const idx = Math.floor(Math.random() * BACKGROUNDS.length);
  background.value = `${config.app.baseURL}${BACKGROUNDS[idx].url}`;
};

randomizeBackground();
useIntervalFn(randomizeBackground, 5000);

const projectList = computed(() => viewerProjectList.value);

const getCYOAPreference = () => {
  return R.find(R.propEq(cyoaPreference.value, 'id'), projectList.value.items);
};

onMounted(async () => {
  if (
    hasPreference() &&
    cyoaPreference.value &&
    store.value.status === 'empty'
  ) {
    const cyoaPreference = getCYOAPreference()!;
    const fileURL = cyoaPreference.remoteFileUrl;
    await loadProject(async (setProgress) => {
      const response = await fetch(fileURL);
      if (response.ok) {
        const reader = response.body!.getReader();

        let received = 0;
        const chunks = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          received += value.length;

          const receivedMB = received / (1024 * 1024);
          const neat = Math.round(receivedMB * 100) / 100;
          await setProgress(`Downloaded ${neat} Mb`);
        }

        await setProgress(`Loading ${cyoaPreference.title}...`);
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
