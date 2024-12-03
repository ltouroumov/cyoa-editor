<template>
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
</template>

<script setup>
import { useProjectStore } from '~/composables/store/project';
import { readFileContents } from '~/composables/utils';

const { loadProject } = useProjectStore();

async function onFileSelect(event) {
  const file = event.files[0];

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
</script>
