<template>
  <div class="load-project" :class="{ inline: $props.inline ?? false }">
    <div class="load-input">
      <label class="form-label">Project File</label>
      <input
        ref="fileInput"
        class="form-control"
        type="file"
        @change="checkCanLoad"
      />
    </div>
    <div v-if="error" class="alert alert-danger load-error mb-3" role="alert">
      {{ error }}
    </div>
    <div
      class="d-flex justify-content-between align-items-center load-button gap-2"
    >
      <button
        class="btn btn-primary"
        :class="{ disabled: !canLoad }"
        @click="loadProjectFile"
      >
        Load Project
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { readFileContents } from '~/composables/utils';

const $props = defineProps<{ inline?: boolean }>();

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

<style lang="scss">
.inline {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.5rem;

  .load-input {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    margin-bottom: 0 !important;
    label {
      display: none;
    }
  }
  .load-button {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
  .load-error {
    grid-column: 1 / 3;
    grid-row: 2 / 3;
  }
}

.load-project {
  .load-input {
    margin-bottom: 0.75rem;
  }
}
</style>
