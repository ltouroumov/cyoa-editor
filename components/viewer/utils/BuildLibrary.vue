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

import {
  getProjectInfo,
  getSelectedItems,
} from '~/components/viewer/utils/build';
import type { SavedBuildData } from '~/components/viewer/utils/types';
import { useProjectRefs } from '~/composables/store/project';
import { IndexedDB } from '~/composables/utils/idb';
import { useIndexedDB } from '~/composables/viewer/useIndexedDB';

const $toast = useToast();
const { selected, backpack, getObject, getObjectRow, getRow, store } =
  useProjectRefs();
const db: IndexedDB = useIndexedDB()!;

const loading = ref<boolean>(false);
const builds = ref<SavedBuildData[]>([]);
const buildName = ref<string>('');

onMounted(async () => {
  loading.value = true;
  await loadBuilds();
  loading.value = false;
});

const saveBuild = async () => {
  await db.transaction('builds', 'readwrite', async (tx) => {
    const table = tx.objectStore('builds');
    const today = new Date();
    const entry: Omit<SavedBuildData, 'id'> = {
      name: buildName.value,
      createdAt: today,
      updatedAt: today,
      project: getProjectInfo(store.value),
      groups: getSelectedItems(
        selected.value,
        backpack.value,
        getObject.value,
        getObjectRow.value,
        getRow.value,
      ),
    };
    await table.add(entry);
    builds.value = await table.getAll();
    $toast.success(`Saved build: ${buildName.value}`);
    buildName.value = '';
  });
};

const loadBuilds = async () => {
  await db.transaction('builds', 'readonly', async (tx) => {
    const store = tx.objectStore('builds');
    builds.value = await store.getAll();
  });
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
