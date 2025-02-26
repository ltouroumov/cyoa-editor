<template>
  <div class="p-6">
    <FileUpload
      mode="basic"
      custom-upload
      accept="application/json"
      choose-label="Upload Index"
      @select="loadProjectFile"
    />
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { readFileContents } from '~/composables/utils';

const { loadProject } = useProjectStore();
const { toggleProjectMenu } = useViewerStore();
const error = ref<string | null>(null);

const loadProjectFile = async (event: any) => {
  if (event.files) {
    const [file] = event.files;
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
