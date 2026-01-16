<template>
  <div
    v-if="mode === 'grid'"
    class="border border-surface-500 rounded overflow-hidden flex flex-col hover:border-primary transition-colors cursor-pointer"
  >
    <div class="aspect-video bg-surface-100 relative overflow-hidden">
      <img
        v-if="image.isRemote"
        :src="image.data"
        :alt="image.id"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <img
        v-else
        :src="`data:image/png;base64,${image.data}`"
        :alt="image.id"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
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
  <div
    v-else
    class="flex flex-row gap-3 items-center border border-surface-500 rounded p-3 hover:border-primary transition-colors cursor-pointer"
  >
    <div class="h-20 w-20 flex-shrink-0 bg-surface-100 rounded overflow-hidden">
      <img
        v-if="image.isRemote"
        :src="image.data"
        :alt="image.id"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <img
        v-else
        :src="`data:image/png;base64,${image.data}`"
        :alt="image.id"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div class="flex flex-col gap-1 grow">
      <div class="text-primary font-mono font-bold">{{ image.id }}</div>
      <div class="text-surface-500 text-sm">
        {{ image.isRemote ? 'Remote' : 'Local' }}
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
  mode: 'grid' | 'list';
}>();
</script>

<style scoped lang="scss"></style>
