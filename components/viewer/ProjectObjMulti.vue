<template>
  <div class="obj-select-multi">
    <div
      v-if="canToggle"
      class="iconify carbon--subtract-alt text-xl"
      :class="{
        'text-green-400': selectedAmount > minSelectedAmount,
        'text-grey-400': selectedAmount <= minSelectedAmount,
      }"
      @click="decrement"
    />
    <span class="mx-1">{{ selectedAmount }}</span>
    <div
      v-if="canToggle"
      class="iconify carbon--add-alt text-xl"
      :class="{
        'text-green-400': selectedAmount < maxSelectedAmount,
        'text-grey-400': selectedAmount >= minSelectedAmount,
      }"
      @click="increment"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProjectObj } from '~/composables/project/types/v1';
import { useObject } from '~/composables/viewer/useObject';

const $props = defineProps<{ obj: ProjectObj }>();
const {
  canToggle,
  selectedAmount,
  minSelectedAmount,
  maxSelectedAmount,
  increment,
  decrement,
} = useObject({
  obj: computed(() => $props.obj),
});
</script>

<style scoped lang="scss"></style>
