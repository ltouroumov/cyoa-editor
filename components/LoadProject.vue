<template>
  <div class="load-project">
    <div class="mb-3">
      <label class="form-label">Project File</label>
      <input
        ref="fileInput"
        class="form-control"
        type="file"
        @change="checkCanLoad"
      />
    </div>
    <div v-if="error" class="alert alert-danger mb-3" role="alert">
      {{ error }}
    </div>
    <div class="d-flex justify-content-between align-items-center gap-2">
      <button
        class="btn btn-primary"
        :class="{ disabled: !canLoad }"
        @click="loadProjectFile"
      >
        Load Project
      </button>
      <div v-if="isLoading" class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';

const { loadProject } = useProjectStore();
const fileInput = ref<HTMLInputElement>();
const isLoading = ref<boolean>(false);
const canLoad = ref<boolean>(false);
const error = ref<string | null>(null);

const checkCanLoad = () => {
  error.value = null;
  if (fileInput.value && fileInput.value.files) {
    const [file] = fileInput.value.files;
    if (!file) {
      canLoad.value = false;
    } else if (file.type !== 'application/json') {
      canLoad.value = false;
      error.value = 'File is not JSON';
    } else {
      canLoad.value = true;
    }
  } else {
    canLoad.value = false;
  }
};

checkCanLoad();

const loadProjectFile = () => {
  if (fileInput.value && fileInput.value.files) {
    const [file] = fileInput.value.files;
    if (!file) {
      error.value = 'No file selected';
      return;
    }

    isLoading.value = true;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (reader.result && typeof reader.result === 'string') {
        const data = JSON.parse(reader.result);
        isLoading.value = false;
        loadProject(data, file.name);
      }
    });
    reader.addEventListener('error', () => {
      error.value = reader.error?.message ?? 'An error occurred';
      isLoading.value = false;
    });

    try {
      reader.readAsText(file);
    } catch (e: unknown) {
      isLoading.value = false;
      if (e instanceof Error) {
        error.value = e.message;
      }
    }
  }
};
</script>

<style lang="scss"></style>
