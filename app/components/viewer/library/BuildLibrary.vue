<template>
  <div class="build-library">
    <DataView
      :value="sortedBuilds"
      data-key="id"
      :dt="{
        header: { padding: '0 0.5rem 1rem 0.5rem' },
      }"
      :sortOrder="sortOrder"
      :sortField="sortField"
    >
      <template #header>
        <div class="flex flex-row gap-1">
          <InputText v-model="buildName" placeholder="Name of build" fluid />
          <Button @click="saveBuild"> Save </Button>
          <Select
            v-model="sortOrder"
            :options="sortOptions"
            option-label="name"
            option-value="value"
            class="ml-2"
            style="width: 10rem"
            placeholder="Sort by"
          />
        </div>
      </template>
      <template #list="{ items }">
        <div class="flex flex-col gap-1 mt-3">
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
import type { SavedBuildData } from '~/composables/shared/tables/viewer_builds';
import { useBuildLibrary } from '~/composables/viewer/useBuildLibrary';
import * as R from 'ramda';

// const $toast = useToast();

const $lib = useBuildLibrary();

const loading = ref<boolean>(false);
const builds = ref<SavedBuildData[]>([]);
const buildName = ref<string>('');

// Sorting
const sortOrder = ref<number>(-1); // -1: desc, 1: asc
const sortField = ref<string>('createdAt');
const sortOptions = [
  { name: 'Newest First', value: -1 },
  { name: 'Oldest First', value: 1 },
];

const sortedBuilds = computed(() => {
  const sortByCreatedAt = R.sortBy((build: SavedBuildData) =>
    new Date(build.createdAt).getTime(),
  );
  const sorted = sortByCreatedAt(builds.value);
  return sortOrder.value === -1 ? R.reverse(sorted) : sorted;
});

onMounted(async () => {
  loading.value = true;
  await loadBuilds();
  loading.value = false;
});

const saveBuild = async () => {
  await $lib.saveBuild(buildName.value);
  // $toast.success(`Saved build: ${buildName.value}`);
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
