<template>
  <div class="build-library">
    <DataView
      :value="builds"
      data-key="id"
      :dt="{ header: { padding: '0 0.5rem 1rem 0.5rem' } }"
    >
      <template #header>
        <div class="flex flex-row gap-1">
          <InputText v-model="buildName" placeholder="Name of build" fluid />
          <Button @click="saveBuild"> Save </Button>
        </div>
      </template>
      <template #list="{ items }">
        <div class="flex flex-col gap-1">
          <BuildCard
            v-for="build in items"
            :key="build.id"
            :build="build"
            @change="loadBuilds"
          />
        </div>
      </template>
    </DataView>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification';

import type { SavedBuildData } from '~/composables/shared/tables/builds';
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
