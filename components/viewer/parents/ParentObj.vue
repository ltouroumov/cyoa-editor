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
      <div class="flex flex-row justify-between items-center">
        <div class="obj-title text-lg">{{ obj.title }}</div>
        <div
          class="size-4 iconify carbon--zoom-in text-surface-300"
          @click.prevent="showMore()"
        ></div>
      </div>
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
import { useViewerStore } from '~/composables/store/viewer';
import { useObject } from '~/composables/viewer/useObject';

const $props = defineProps<{ obj: ProjectObj }>();

const { isEnabled, isSelected, canToggle, toggle } = useObject({
  obj: computed(() => $props.obj),
});

const viewerStore = useViewerStore();
const showMore = () => {
  viewerStore.showObjectDetails = { id: $props.obj.id, tab: 'details' };
};
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
