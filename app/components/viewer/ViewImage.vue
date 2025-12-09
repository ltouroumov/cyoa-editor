<template>
  <div ref="wrapper" class="image-wrapper">
    <img
      v-if="isNotNil(imageSrc)"
      ref="image"
      class="image"
      :decoding="alwaysEnable ? `sync` : `auto`"
      :loading="alwaysEnable ? `eager` : `lazy`"
      :src="imageSrc"
      :alt="element.title"
    />
  </div>
</template>

<script setup lang="ts">
import { isNil, isNotNil } from 'ramda';

import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useImageSrc } from '~/composables/viewer/cache/useImageSrc';

const { loadImageSrc } = useImageSrc();
const $props = defineProps<{
  element: ProjectObj | ProjectRow;
  alwaysEnable?: boolean;
}>();

const imageSrc = ref<string | null>(null);

const wrapper = ref<HTMLDivElement>();
const handleObserver: IntersectionObserverCallback = (entries) => {
  entries.forEach((entry) => {
    if (
      entry.isIntersecting &&
      entry.target === wrapper.value &&
      isNil(imageSrc.value)
    ) {
      loadImageSrc($props.element).then((src) => {
        imageSrc.value = src;
      });
    }
  });
};
let observer: IntersectionObserver;

onMounted(() => {
  observer = new IntersectionObserver(handleObserver, {
    root: null,
    rootMargin: '10px',
  });
  observer.observe(wrapper.value!);
});
onUnmounted(() => {
  observer.disconnect();
});
</script>

<style scoped lang="scss">
.image-wrapper {
  width: 100%;
  height: 100%;
}

.image {
  width: 100%;
  object-fit: contain;
}
</style>
