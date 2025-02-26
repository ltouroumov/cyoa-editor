<template>
  <div class="flex flex-row justify-center items-center bg-surface-700">
    <Image :src="media.data" pt:image:class="object-contain object-center" />
  </div>
</template>

<script setup lang="ts">
import type { ProjectImage } from '~/composables/project/types/v2/media';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  mediaId: string;
}>();

const media = computed((): ProjectImage => {
  return projectStore.media.images[props.mediaId];
});
</script>

<style scoped lang="scss"></style>
