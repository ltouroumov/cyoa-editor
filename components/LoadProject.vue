<template>
  <div class="load-project">
    <div class="flex flex-row gap-1">
      <input
        ref="fileInput"
        class="form-control size-auto grow"
        type="file"
        @change="checkCanLoad"
      />
      <button
        class="btn btn-primary size-fit"
        :class="{ disabled: !canLoad }"
        @click="loadProjectFile"
      >
        Load Project
      </button>
    </div>
    <div v-if="error" class="alert alert-danger mt-2" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { readFileContents } from '~/composables/utils';

const { loadProject } = useProjectStore();
const { toggleProjectMenu } = useViewerStore();
const fileInput = ref<HTMLInputElement>();
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

const loadProjectFile = async () => {
  if (fileInput.value && fileInput.value.files) {
    const [file] = fileInput.value.files;
    if (!file) {
      error.value = 'No file selected';
      return;
    }

    toggleProjectMenu(false);
    await loadProject(async () => {
      const data = await readFileContents(file);
      if (data && typeof data === 'string') {
        return {
          fileContents: data,
          fileName: file.name,
        };
      }
    });
  }
};
</script>

<style lang="scss"></style>
