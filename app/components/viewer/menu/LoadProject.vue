<template>
  <div class="load-project" :class="{ inline: $props.inline ?? false }">
    <div class="load-input">
      <FileUpload
        mode="basic"
        :custom-upload="true"
        accept="application/json"
        :max-file-size="100 * 1024 * 1024"
        :auto="true"
        choose-icon="pi pi-file-plus"
        choose-label="Upload Project"
        @select="onFileSelect"
      />
    </div>
    <div v-if="error" class="alert alert-danger load-error mb-3" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue';

import { useViewerLibrary } from '~/composables/viewer/useViewerLibrary';

const $props = defineProps<{ inline?: boolean }>();

const { addProject } = useViewerLibrary();
const error = ref<string | null>(null);

const onFileSelect = async (event: FileUploadSelectEvent) => {
  const file = event.files[0];
  await addProject(file, false);
};
</script>

<style lang="scss">
.inline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .load-input {
    margin-bottom: 0 !important;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;

    label {
      display: none;
    }
  }
}

.load-project {
  .load-input {
    margin-bottom: 0.75rem;
  }
}
</style>
