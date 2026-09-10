<template>
  <div class="addon" :class="{ disabled: !isEnabled }">
    <div
      v-if="
        isNotNil(addon.image) &&
        isNotEmpty(addon.image) &&
        !display?.hideObjectImages
      "
      class="obj-image-container"
    >
      <ViewImage :element="addon" :always-enable="alwaysEnable" />
    </div>
    <div class="addon-content">
      <div class="title">{{ addon.title }}</div>
      <ViewRequirements
        v-if="!display?.hideAddonRequirements"
        :requireds="addon.requireds"
        :show-always="true"
        :enable-show-more="!display?.hideObjectRequirementMore"
        :show-active="!display?.hideObjectRequirementStatus"
        @show-more="showParents()"
      />
      <!-- eslint-disable vue/no-v-html -->
      <div
        v-if="!display?.hideAddonText"
        class="text"
        v-html="formatText(addon.text)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty, isNil, isNotEmpty, isNotNil } from 'ramda';

import { buildConditions } from '~/composables/conditions';
import type { ObjAddon } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';
import { useViewerStore } from '~/composables/store/viewer';
import { ViewContext } from '~/composables/viewer';
import { usePoints } from '~/composables/viewer/usePoints';

const $props = defineProps<{
  objId: string;
  index: number;
  addon: ObjAddon;
  display?: Partial<DisplaySettings>;
  viewObject?: ViewContext;
  parentEnabled?: boolean;
}>();

const { selectedIds } = useProjectRefs();
const { points } = usePoints();

const condition = computed(() => buildConditions($props.addon));
const isEnabled = computed(() =>
  condition.value(selectedIds.value, points.value),
);

const viewerStore = useViewerStore();
const showParents = () => {
  viewerStore.showObjectDetails = {
    id: $props.objId,
    addonId:
      isNil($props.addon.id) || isEmpty($props.addon.id)
        ? $props.index
        : $props.addon.id,
    tab: 'parents',
  };
};

const alwaysEnable = computed<boolean>(() => {
  switch ($props.viewObject) {
    case ViewContext.BackpackEnabled:
    case ViewContext.BackpackDisabled:
      return true;
    default:
      return false;
  }
});
</script>

<style lang="scss">
.addon-content {
  display: flex;
  flex-direction: column;
  padding: 0.5em;
}
</style>
