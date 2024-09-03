<template>
  <div class="build-library">
    <div class="input-group">
      <input v-model="buildName" type="text" class="form-control" />
      <button class="btn btn-outline-primary" @click="addStuff">Save</button>
    </div>
    <div v-show="loading" class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div class="build-list">
      <div v-for="build in builds" :key="build.id" class="build-details">
        <div class="name">{{ build.name }}</div>
        <div class="date">{{ build.updatedAt?.toLocaleDateString() }}</div>
        <div class="choices">{{ build.selected }}</div>
        <div class="actions">
          <button class="btn btn-outline-primary" @click="loadBuild(build)">
            Load
          </button>
          <button class="btn btn-outline-primary" @click="saveBuild(build)">
            Save
          </button>
          <button class="btn btn-outline-danger" @click="deleteBuild(build.id)">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';

import { Selections, useProjectRefs } from '~/composables/store/project';
import { IndexedDB } from '~/composables/utils/idb';

const { selected } = useProjectRefs();
let db: IndexedDB;

type BuildData = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  selected: Selections;
};

const loading = ref<boolean>(false);
const builds = ref<BuildData[]>([]);
const buildName = ref<string>('');

onMounted(async () => {
  loading.value = true;
  db = await IndexedDB.open('cyoa-editor', 1, (db) => {
    db.createObjectStore('builds', { keyPath: 'id', autoIncrement: true });
  });

  await loadBuilds();
  loading.value = false;
});

const loadBuilds = async () => {
  await db.transaction('builds', 'readonly', async (tx) => {
    const store = tx.objectStore('builds');
    builds.value = await store.getAll();
  });
};

const addStuff = async () => {
  await db.transaction('builds', 'readwrite', async (tx) => {
    const store = tx.objectStore('builds');
    await store.add({
      name: buildName.value,
      createdAt: new Date(),
      updatedAt: new Date(),
      selected: R.clone(selected.value),
    });
    builds.value = await store.getAll();
  });
};

const saveBuild = async (build: any) => {
  await db.transaction('builds', 'readwrite', async (tx) => {
    const store = tx.objectStore('builds');
    await store.put({
      ...build,
      updatedAt: new Date(),
      selected: R.clone(selected.value),
    });
    builds.value = await store.getAll();
  });
};

const deleteBuild = async (id: any) => {
  await db.transaction('builds', 'readwrite', async (tx) => {
    const store = tx.objectStore('builds');
    await store.delete(id);
    builds.value = await store.getAll();
  });
};

const loadBuild = (build: any) => {
  selected.value = build.selected;
};
</script>

<style scoped lang="scss">
.build-library {
  min-width: 500px;
}
</style>
