<template>
  <div v-if="isLoaded" id="container">
    <div id="dialog">
      <LoadProject />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';

const { isLoaded } = useProjectStore();
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
