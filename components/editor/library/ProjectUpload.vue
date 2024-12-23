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

<script setup lang="ts">
import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';
import { readFileContents } from '~/composables/utils';

const { importProjectFile } = useEditorLibrary();

async function onFileSelect(event: any) {
  const file = event.files[0];
  const data = await readFileContents(file);
  if (data && typeof data === 'string') {
    const projectData = JSON.parse(data);
    await importProjectFile(projectData);
  }
}
</script>
