<template>
  <div id="container">
    <div id="dialog">
      <LoadProject v-if="!project" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, useProjectFile} from '#imports';

const project = useProjectFile();
</script>

<style lang="scss">
#container {
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
}

#dialog {
  border: 2px solid black;
  border-radius: 10px;
  padding: 10px;
}
</style>