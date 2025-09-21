<template>
  <div
    class="project-obj obj-horizontal flex flex-row gap-2 px-2 py-1 rounded-md"
    :class="{
      selected: isSelected,
      disabled: !isEnabled,
      canToggle: canToggle,
    }"
    @click.capture="toggle"
  >
    <div class="grow flex flex-col gap-0">
      <div class="obj-title text-lg">{{ obj.title }}</div>
      <ProjectObjMulti v-if="obj.isSelectableMultiple" :obj="obj" />
      <ViewRequirements
        :requireds="obj.requireds"
        class="left text-surface-500 text-sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectObjMulti from '~/components/viewer/ProjectObjMulti.vue';
import type { ProjectObj } from '~/composables/project/types/v1';
import { useObject } from '~/composables/viewer/useObject';

const $props = defineProps<{ obj: ProjectObj }>();

const {
  isEnabled,
  isSelected,
  canToggle,
  selectedAmount,
  minSelectedAmount,
  maxSelectedAmount,
  toggle,
  increment,
  decrement,
} = useObject($props.obj);
</script>

<style scoped lang="scss">
.project-obj.obj-horizontal {
  background-color: var(--obj-bg-color);
  border: var(--obj-border);
  border-radius: var(--obj-border-radius);

  .obj-title {
    font-family: var(--obj-title-font) sans-serif;
    color: var(--obj-title-color);
  }

  &.selected {
    filter: var(--obj-selected-filter);
    background-color: var(--obj-selected-bg-color);
  }
  &.disabled {
    filter: var(--obj-disabled-filter);
    background-color: var(--obj-disabled-bg-color);
  }
}
</style>
