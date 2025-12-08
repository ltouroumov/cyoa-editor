<template>
  <div class="image-wrapper">
    <img
      v-if="isNotNil(imageUrl)"
      ref="image"
      class="image"
      :decoding="alwaysEnable ? `sync` : `auto`"
      :loading="alwaysEnable ? `eager` : `lazy`"
      :src="imageUrl"
      :alt="element.title"
    />
  </div>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import { useImageSrc } from '~/composables/viewer/cache/useImageSrc';

const { isLocal, project } = useProjectRefs();
const $props = defineProps<{
  element: ProjectObj | ProjectRow;
  alwaysEnable?: boolean;
}>();
const imageUrl = useImageSrc({
  isLocal: isLocal,
  element: computed(() => $props.element),
  projectFile: project,
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
