<template>
  <div class="load-project">
    <div class="mb-3">
      <label class="form-label">Project File</label>
      <input class="form-control" type="file" ref="fileInput"/>
    </div>
    <div>
      <button class="btn btn-outline-primary" @click="loadProject">Load Project</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, useProjectFile} from '#imports';

const projectFile = useProjectFile();
const fileInput = ref<HTMLInputElement>();

const loadProject = () => {
  if (fileInput.value && fileInput.value.files) {
    const [file] = fileInput.value.files;

    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('load', () => {
      if (reader.result && typeof reader.result === 'string') {
        const project = JSON.parse(reader.result);
        projectFile.value = {
          project,
          file: file.name,
        };
      }
    });

  }
};
</script>

<style lang="scss">
.load-project {
  min-width: 500px;
}
</style>