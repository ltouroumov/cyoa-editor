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
import { useDexie } from '~/composables/shared/useDexie';
import { readFileContents } from '~/composables/utils';

const dexie = useDexie();

async function onFileSelect(event: any) {
  const file = event.files[0];
  const data = await readFileContents(file);
  if (data && typeof data === 'string') {
    const projectData: Project = JSON.parse(data);
    const projectName = projectData.rows[0].title;

    const projectId = await dexie.projects.add({
      name: projectName,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const versionId = await dexie.projects_versions.add({
      projectId: projectId,
      data: projectData,
      createdAt: new Date(),
    });

    await dexie.projects.update(projectId, {
      currentVersionId: versionId,
    });
  }
}
</script>
