<template>
  <div
    v-if="hasVisibleReqs"
    class="obj-requirements relative"
    :class="{ 'pe-6': enableShowMore && hasVisibleReqs }"
  >
    <ViewRequirement
      v-for="(req, idx) in requireds"
      :key="idx"
      :req="req"
      :show-always="showAlways"
    />
    <div
      v-if="enableShowMore && hasVisibleReqs"
      class="absolute right-0 top-0 bottom-0 flex items-center justify-center w-6 cursor-pointer"
      @click.stop.prevent="$emit('show-more')"
    >
      <div class="iconify carbon--zoom-in"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { any } from 'ramda';

import ViewRequirement from '~/components/viewer/ViewRequirement.vue';
import type { ConditionTerm } from '~/composables/project/types/v1';

const $props = defineProps<{
  requireds: ConditionTerm[];
  showAlways?: boolean;
  enableShowMore?: boolean;
}>();
defineEmits(['show-more']);

const hasVisibleReqs = computed(
  () => $props.showAlways || any((term) => term.showRequired, $props.requireds),
);
</script>

<style lang="scss">
.obj-requirements {
  display: flex;
  flex-direction: column;
  align-items: center;

  &.left {
    align-items: flex-start;
  }
}
</style>
