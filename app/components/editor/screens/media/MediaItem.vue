<template>
  <div
    class="flex flex-row gap-3 items-center border border-surface-500 rounded p-3"
  >
    <div class="h-20 w-20 shrink-0 bg-surface-100 rounded overflow-hidden">
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
      <Button
        size="small"
        variant="outlined"
        severity="secondary"
        @click="editImage()"
      >
        <span class="iconify solar--pen-line-duotone" />
        Edit
      </Button>
      <Button size="small" variant="outlined" severity="secondary">
        <span class="iconify solar--link-line-duotone" />
        Uses
      </Button>
      <CardMenu :object-id="image.id" :type="EntityType.Image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { EntityType } from '~/composables/project/types/v2/base';
import type { ProjectImage } from '~/composables/project/types/v2/media';

const editorStore = useEditorStore();

const props = defineProps<{
  image: ProjectImage;
}>();

function editImage() {
  editorStore.pushScreen({
    type: 'edit-image',
    imageId: props.image.id,
  });
}
</script>

<style scoped lang="scss"></style>
