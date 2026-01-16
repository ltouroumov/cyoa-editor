<template>
  <div
    class="border border-surface-500 rounded overflow-hidden flex flex-col hover:border-primary transition-colors cursor-pointer"
  >
    <div class="aspect-video bg-surface-100 relative overflow-hidden">
      <img
        :src="image.data"
        :alt="image.id"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div
        v-if="image.metadata?.title"
        class="absolute top-0 left-0 right-0 bg-black/70 text-xs font-mono px-2 py-1 truncate flex flex-row justify-between"
      >
        {{ image.metadata.title }}
      </div>
      <div
        class="absolute bottom-0 left-0 right-0 bg-black/70 text-xs font-mono px-2 py-1 truncate flex flex-row justify-between"
      >
        <span class="text-surface-500">
          {{ image.isRemote ? 'Remote' : 'Local' }}
        </span>
        <span class="text-white">{{ image.id }}</span>
      </div>
    </div>
    <div class="p-2 flex flex-row gap-2 justify-end">
      <Button
        size="small"
        variant="outlined"
        severity="secondary"
        icon="iconify solar--pen-line-duotone"
      />
      <Button
        size="small"
        variant="outlined"
        severity="danger"
        icon="iconify solar--trash-bin-trash-line-duotone"
      />
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
