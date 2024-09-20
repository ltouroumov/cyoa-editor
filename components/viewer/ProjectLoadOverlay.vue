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
      <img v-if="isNotNil(background)" :src="background" alt="Background ..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import { useProjectRefs } from '~/composables/store/project';

const { store } = useProjectRefs();

const background = ref<string | null>(null);
const BACKGROUNDS = [
  { url: '/bgs/load-01.jpg' },
  { url: '/bgs/load-02.jpg' },
  { url: '/bgs/load-04.jpg' },
  { url: '/bgs/load-05.png' },
  { url: '/bgs/load-06.jpg' },
  { url: '/bgs/load-07.webp' },
  { url: '/bgs/load-08.jpg' },
  { url: '/bgs/load-09.jpg' },
];

const randomizeBackground = () => {
  const idx = Math.floor(Math.random() * BACKGROUNDS.length);
  background.value = BACKGROUNDS[idx].url;
};

randomizeBackground();
useIntervalFn(randomizeBackground, 5000);
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
    }
  }
}
</style>
