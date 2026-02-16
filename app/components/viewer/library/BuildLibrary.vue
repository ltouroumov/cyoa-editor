<template>
  <div class="build-library">
    <DataView
      :value="sortedBuilds"
      data-key="id"
      :dt="{
        header: { padding: '0 0.5rem 1rem 0.5rem' },
      }"
      :sort-order="sortOrder"
      :sort-field="sortField"
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
          <Button
            severity="secondary"
            icon="pi pi-ellipsis-v"
            @click="toggleMenu"
          />
          <Menu ref="menuRef" :model="menuItems" :popup="true" />
          <input
            ref="fileInputRef"
            type="file"
            accept="application/json,.json"
            class="hidden"
            @change="onFileChange"
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
import { useToast } from 'primevue/usetoast';
import * as R from 'ramda';

import type { SavedBuildData } from '~/composables/shared/tables/builds';
import { readFileContents } from '~/composables/utils';
import { useBuildLibrary } from '~/composables/viewer/useBuildLibrary';

const $toast = useToast();

const $lib = useBuildLibrary();

const loading = ref<boolean>(false);
const builds = ref<SavedBuildData[]>([]);
const buildName = ref<string>('');

// Menu
const menuRef = ref();
const fileInputRef = ref<HTMLInputElement>();
const toggleMenu = (event: Event) => menuRef.value.toggle(event);
const menuItems = [
  {
    label: 'Export Backup',
    icon: 'pi pi-download',
    command: () => exportBackup(),
  },
  {
    label: 'Import Backup',
    icon: 'pi pi-upload',
    command: () => fileInputRef.value?.click(),
  },
];

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

const exportBackup = async () => {
  await $lib.exportBuilds();
  $toast.add({ severity: 'success', summary: 'Backup exported', life: 2000 });
};

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // Reset so the same file can be re-selected
  input.value = '';

  try {
    const content = await readFileContents(file);
    const parsed = JSON.parse(content as string);

    if (!parsed.builds || !Array.isArray(parsed.builds)) {
      $toast.add({
        severity: 'error',
        summary: 'Invalid backup file',
        life: 3000,
      });
      return;
    }

    const result = await $lib.importBuilds(parsed.builds);
    await loadBuilds();

    $toast.add({
      severity: 'success',
      summary: `Imported ${result.imported} build(s), skipped ${result.skipped}`,
      life: 3000,
    });
  } catch {
    $toast.add({
      severity: 'error',
      summary: 'Failed to import backup',
      life: 3000,
    });
  }
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
