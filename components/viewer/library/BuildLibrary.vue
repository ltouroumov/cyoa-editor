<template>
  <div class="build-library">
    <div class="build-create-form">
      <label class="text-secondary font-bold">Save Build</label>
      <div class="input-group">
        <input
          v-model="buildName"
          type="text"
          class="form-control"
          placeholder="Name"
        />
        <button class="btn btn-outline-primary" @click="saveBuild">Save</button>
      </div>
    </div>
    <div class="folder-create-form">
      <label class="text-secondary font-bold">New Folder</label>
      <div class="input-group">
        <input
          v-model="folderName"
          type="text"
          class="form-control"
          placeholder="Name"
        />
        <button class="btn btn-outline-primary" @click="saveFolder">
          Save
        </button>
      </div>
    </div>
    <div class="divider"></div>
    <nav class="build-nav">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">Builds</li>
        <li class="breadcrumb-item">2021</li>
      </ol>
      <div class="build-tools">
        <div class="build-sort btn btn-outline-secondary btn-sm">
          <span>Name</span>
          <span class="i-solar:arrow-down-bold icon"></span>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm">Save Build</button>
          <button class="btn btn-outline-primary btn-sm">New Folder</button>
        </div>
      </div>
    </nav>
    <div class="build-search-form">
      <input
        v-model="buildSearch"
        type="text"
        class="form-control"
        placeholder="Search ..."
      />
    </div>
    <div v-show="loading" class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div class="build-list">
      <div v-for="folder in folders" :key="folder.id" class="folder">
        <span class="icon i-solar:folder-favourite-bookmark-outline"></span>
        <span>{{ folder.name }}</span>
      </div>
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

import type {
  SavedBuildData,
  SavedBuildFolder,
} from '~/components/viewer/utils/types';
import { useBuildLibrary } from '~/composables/viewer/useBuildLibrary';

const $toast = useToast();

const $lib = useBuildLibrary();

const folderName = ref<string>('');
const buildName = ref<string>('');
const buildSearch = ref<string>('');

const loading = ref<boolean>(false);
const folder = ref<number>(0);
const builds = ref<SavedBuildData[]>([]);
const folders = ref<SavedBuildFolder[]>([]);

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

const saveFolder = async () => {
  await $lib.saveFolder(folderName.value, folder.value);
  folderName.value = '';
  await loadBuilds();
};

const loadBuilds = async () => {
  builds.value = await $lib.loadBuilds(folder.value);
  folders.value = await $lib.loadFolders(folder.value);
};
</script>

<style scoped lang="scss">
.build-library {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.build-create-form {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.build-search-form {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
}

.build-nav {
  display: flex;
  flex-direction: row;
  gap: 1rem;

  ol.breadcrumb {
    flex-grow: 1;
    margin-bottom: 0;
  }

  .build-tools {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
  }

  .build-sort {
    display: inline-flex;
    align-items: center;
  }
}

.build-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.folder {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;

  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--bs-border-color);
}

.divider {
  border-bottom: 1px solid white;
}

.icon {
  display: inline-block;
  width: 1rem;
  height: 1rem;
}
</style>
