<template>
  <div
    class="project-obj obj-horizontal flex flex-row gap-2 px-2 py-1 rounded-md"
    :class="{ selected: isEnabled, disabled: !isEnabled }"
  >
    <div class="grow flex flex-col gap-0">
      <div class="flex flex-row justify-between items-center">
        <div class="obj-title text-lg">{{ addon.title }}</div>
      </div>
      <ViewRequirements
        :requireds="addon.requireds"
        :show-always="true"
        class="left text-surface-500 text-sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { buildConditions } from '~/composables/conditions';
import type { ObjAddon, ProjectObj } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';

const $props = defineProps<{ obj: ProjectObj; addon: ObjAddon }>();

const { selectedIds } = useProjectRefs();
const condition = computed(() => buildConditions($props.addon));
const isEnabled = computed(() => condition.value(selectedIds.value));
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
