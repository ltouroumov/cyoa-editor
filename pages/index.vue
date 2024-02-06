<template>
  <div v-if="project" class="text-light">
    <ViewMenuBar />
    <div class="project">
      <div class="rows">
        <ViewProjectRow
          v-for="row in project.data.rows"
          :key="row.id"
          :row="row"
        />
      </div>
    </div>
    <ViewBackpack />
    <ViewSearch />
  </div>
  <div v-else class="dialog-container">
    <div class="dialog bg-dark-subtle text-light">
      <h5>Default Files</h5>
      <ul class="list-group mb-3">
        <li class="list-group-item">
          <a
            href="https://raw.githubusercontent.com/ltouroumov/worm-cyoa-v6-fork/master/project-v17.json"
            @click.prevent="loadRemoteFile"
          >
            Worm V6 (Lt's Fork)
          </a>
        </li>
      </ul>
      <div
        v-if="isLoading"
        class="d-flex align-items-center justify-content-start gap-3 mb-3"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <strong>Loading ...</strong>
      </div>

      <h5>Load File</h5>
      <LoadProject />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from '#imports';
import ViewBackpack from '~/components/viewer/modal/ViewBackpack.vue';
import ViewSearch from '~/components/viewer/modal/ViewSearch.vue';
import ViewMenuBar from '~/components/viewer/ViewMenuBar.vue';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const { loadProject } = useProjectStore();
const { project } = useProjectRefs();

const isLoading = ref<boolean>(false);

const loadRemoteFile = async ({ target }: MouseEvent) => {
  if (target && target instanceof HTMLAnchorElement) {
    isLoading.value = true;
    const fileURL = target.href;
    const result: any = await $fetch(fileURL, { parseResponse: JSON.parse });
    loadProject(result, fileURL);
    isLoading.value = false;
  }
};
</script>

<style lang="scss">
.project {
  background: black;
  color: white;

  font-family: sans-serif;
  padding: 0 1em;
}

.dialog-container {
  min-height: 50vh;

  display: flex;
  justify-content: center;
  align-items: center;

  .dialog {
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
  }
}
</style>
