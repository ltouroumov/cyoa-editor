<template>
  <div class="build-library">
    <div class="input-group">
      <input
        v-model="buildName"
        type="text"
        class="form-control"
        placeholder="Name of build"
      />
      <button class="btn btn-outline-primary" @click="saveBuild">Save</button>
    </div>
    <div v-show="loading" class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div class="build-list">
      <BuildCard
        v-for="build in builds"
        :key="build.id"
        :build="build"
        @change="loadBuilds"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification';

import type { SavedBuildData } from '~/components/viewer/utils/types';
import { useBuildLibrary } from '~/composables/viewer/useBuildLibrary';

const $toast = useToast();

const $lib = useBuildLibrary();

const loading = ref<boolean>(false);
const builds = ref<SavedBuildData[]>([]);
const buildName = ref<string>('');

onMounted(async () => {
  loading.value = true;
  await loadBuilds();
  loading.value = false;
});

const saveBuild = async () => {
  await $lib.saveBuild(buildName.value);
  $toast.success(`Saved build: ${buildName.value}`);
  buildName.value = '';
  await loadBuilds();
};

const loadBuilds = async () => {
  builds.value = await $lib.loadBuilds();
};
</script>

<style scoped lang="scss">
.build-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  margin-top: 1rem;
}
</style>
