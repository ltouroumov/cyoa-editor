<template>
  <div
    class="border border-surface-500 rounded overflow-hidden flex flex-col hover:border-primary transition-colors cursor-pointer"
  >
    <div class="aspect-video bg-surface-100 relative overflow-hidden">
      <img
        :src="image.data"
        :alt="image.id"
        class="w-full h-full object-cover"
      />
      <div
        class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs font-mono px-2 py-1 truncate"
      >
        {{ image.id }}
      </div>
    </div>
    <div class="p-2 flex flex-row gap-2 justify-end">
      <Button size="small" variant="outlined" severity="secondary">
        Edit
      </Button>
      <Button size="small" variant="outlined" severity="danger">
        Delete
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectImage } from '~/composables/project/types/v2/media';

const props = defineProps<{
  image: ProjectImage;
}>();
</script>

<style scoped lang="scss"></style>
