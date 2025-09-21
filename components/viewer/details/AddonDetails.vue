<template>
  <div
    class="obj-addon-details pt-[60px] md:pt-[120px]"
    :class="{ disabled: !isEnabled }"
  >
    <div class="obj-header">
      <div class="title">{{ addon.title }}</div>
      <ViewRequirements
        :requireds="addon.requireds"
        :show-always="true"
        :enable-show-more="true"
      />
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <div class="text" v-html="formatText(addon.text)"></div>
  </div>
</template>

<script setup lang="ts">
import { buildConditions } from '~/composables/conditions';
import type { ObjAddon } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import { formatText } from '~/composables/text';

const $props = defineProps<{ addon: ObjAddon }>();

const { selectedIds } = useProjectRefs();

const condition = computed(() => buildConditions($props.addon));
const isEnabled = computed(() => condition.value(selectedIds.value));
</script>

<style scoped lang="scss">
.obj-addon-details {
  //background-image: var(--bg-gradient);

  .title {
    font-family: var(--obj-addon-title-font) sans-serif;
    font-size: var(--obj-addon-title-size);
    color: var(--obj-addon-title-color);
    text-align: var(--obj-addon-title-align);
  }

  .text {
    font-family: var(--obj-addon-text-font) sans-serif;
    font-size: var(--obj-addon-text-size);
    color: var(--obj-addon-text-color);
    text-align: var(--obj-addon-text-align);
    padding: var(--obj-text-padding);
  }

  .obj-header {
    padding-left: 10px;
    padding-right: 10px;
  }

  :deep(.obj-score),
  :deep(.obj-requirements) {
    font-family: var(--obj-score-font) sans-serif;
    font-size: var(--obj-score-size);
    text-align: var(--obj-score-align);
    color: var(--obj-score-color);
  }

  &.disabled {
    --bg-gradient: linear-gradient(
      180deg,
      rgba(from var(--obj-addon-disabled-bg-color) r g b / 0%) 0px,
      rgba(from var(--obj-addon-disabled-bg-color) r g b / 75%) 100px,
      rgba(from var(--obj-addon-disabled-bg-color) r g b / 75%) 150px,
      rgba(from var(--obj-addon-disabled-bg-color) r g b / 100%) 250px,
      var(--obj-addon-disabled-bg-color) 100%
    );
    filter: var(--obj-addon-disabled-filter);
  }
}
</style>
