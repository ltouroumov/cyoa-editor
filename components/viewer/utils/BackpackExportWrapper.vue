<template>
  <div class="export-container" data-bs-theme="dark">
    <BackpackView
      :vertical-score="false"
      :show-title="true"
      :lock-backpack="true"
      :hide-disabled-addons="true"
    />
  </div>
</template>

<script setup lang="ts">
import BackpackView from '~/components/viewer/utils/BackpackView.vue';
</script>

<style scoped lang="scss">
.export-container {
  padding: 1rem;
}
</style>
