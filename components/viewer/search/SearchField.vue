<template>
  <Button
    :unstyled="true"
    class="flex flex-row items-center border border-surface-500 rounded-full ps-3 pe-2 py-1"
    @click="toggleSearch()"
  >
    <div class="w-4 border-b border-surface-300 h-5"></div>
    <div class="h-5 w-8"></div>
    <div class="size-5 iconify solar--magnifer-outline"></div>
  </Button>
</template>

<script setup lang="ts">
import { useViewerStore } from '~/composables/store/viewer';

const { toggleSearch } = useViewerStore();
</script>

<style scoped lang="scss">
.search-field {
  @apply bg-transparent h-6;

  &:focus {
    @apply outline-none;
  }
}

.search-field-btn {
  @apply flex flex-row items-center justify-center;
}
</style>
