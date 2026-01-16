<template>
  <div :style="{ width: width }" class="rounded overflow-hidden">
    <Image :src="media.data" />
  </div>
</template>

<script setup lang="ts">
import type { ProjectImage } from '~/composables/project/types/v2/media';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  mediaId: string;
  width?: string;
}>();

const media = computed((): ProjectImage => {
  return projectStore.media.images[props.mediaId];
});
</script>

<style scoped lang="scss"></style>
