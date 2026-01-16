<template>
  <div
    class="flex flex-row gap-3 items-center border border-surface-500 rounded p-3 hover:border-primary transition-colors cursor-pointer"
  >
    <div class="h-20 w-20 flex-shrink-0 bg-surface-100 rounded overflow-hidden">
      <img
        :src="image.data"
        :alt="image.id"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div class="flex flex-col gap-1 grow">
      <div v-if="image.metadata?.title" class="text-primary font-bold">
        {{ image.metadata.title }}
      </div>
      <div class="flex flex-row gap-1 items-center">
        <div class="font-mono">{{ image.id }}</div>
        <div class="text-surface-500 text-sm">
          {{ image.isRemote ? 'Remote' : 'Local' }}
        </div>
      </div>
    </div>
    <div class="flex flex-row gap-2">
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
