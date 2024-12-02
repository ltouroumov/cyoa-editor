<template>
  <FileUpload
    mode="basic"
    :custom-upload="true"
    accept="application/json"
    :max-file-size="100 * 1024 * 1024"
    @select="onFileSelect"
  >
  </FileUpload>
</template>

<script setup>
import { ref } from 'vue';

const src = ref(null);

function onFileSelect(event) {
  const file = event.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    console.log(e.target.result);
  };

  reader.readAsDataURL(file);
}
</script>
