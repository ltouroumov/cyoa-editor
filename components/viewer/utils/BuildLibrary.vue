<template>
  <div class="build-library">
    <div class="input-group">
      <input
        v-model="buildName"
        type="text"
        class="form-control"
        placeholder="Name of build"
      />
      <button class="btn btn-outline-primary" @click="addStuff">Save</button>
    </div>
    <div v-show="loading" class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div class="build-list">
      <div v-for="build in builds" :key="build.id" class="build-details">
        <div class="name">{{ build.name }}</div>
        <div class="date">{{ build.updatedAt?.toLocaleDateString() }}</div>
        <div class="choices">
          <BuildChoices :selected="build.selected" />
        </div>
        <div class="actions">
          <button
            class="btn btn-outline-primary btn-sm"
            @click="loadBuild(build)"
          >
            Load
          </button>
          <button
            class="btn btn-outline-primary btn-sm"
            @click="saveBuild(build)"
          >
            Save
          </button>
          <button
            class="btn btn-sm btn-outline-danger"
            @click="deleteBuild(build)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { useToast } from 'vue-toastification';

import BuildChoices from '~/components/viewer/utils/BuildChoices.vue';
import {
  Selections,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';
import { IndexedDB } from '~/composables/utils/idb';

const $toast = useToast();
const { selected } = useProjectRefs();
const { setSelected } = useProjectStore();
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
    $toast.success(`Saved build: ${buildName.value}`);
    buildName.value = '';
  });
};

const saveBuild = async (build: BuildData) => {
  if (R.isEmpty(selected.value)) {
    $toast.error("No selections are made,\nThere's nothing to save.");
    return;
  }
  await db.transaction('builds', 'readwrite', async (tx) => {
    const store = tx.objectStore('builds');
    await store.put({
      ...build,
      updatedAt: new Date(),
      selected: R.clone(selected.value),
    });
    builds.value = await store.getAll();
    $toast.success(`Updated Build: ${build.name}`);
  });
};

const deleteBuild = async (build: BuildData) => {
  await db.transaction('builds', 'readwrite', async (tx) => {
    const store = tx.objectStore('builds');
    await store.delete(build.id);
    builds.value = await store.getAll();
  });
  $toast.success(`Deleted Build: ${build.name}`);
};

const loadBuild = (build: BuildData) => {
  setSelected(build.selected, true);
  $toast.info(`Loaded Build: ${build.name}`);
};
</script>

<style scoped lang="scss">
.build-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  margin-top: 1rem;

  .build-details {
    display: grid;
    grid-template:
      'name actions' auto
      'date actions' auto
      'choices choices' auto
      / 1fr auto;

    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--bs-border-color);

    .name {
      grid-area: name;
      font-size: 1.25em;
      font-weight: bold;
    }

    .date {
      grid-area: date;
      font-style: italic;
      color: gray;
    }

    .choices {
      grid-area: choices;
    }

    .actions {
      grid-area: actions;
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      align-items: flex-start;
    }
  }
}
</style>
