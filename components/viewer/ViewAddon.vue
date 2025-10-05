<template>
  <div class="addon" :class="{ disabled: !isEnabled }">
    <div class="title">{{ addon.title }} // {{ index }}</div>
    <ViewRequirements
      v-if="!display?.hideAddonRequirements"
      :requireds="addon.requireds"
      :show-always="true"
      :enable-show-more="true"
      @show-more="showParents()"
    />
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="!display?.hideAddonText"
      class="text"
      v-html="formatText(addon.text)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty, isNil } from 'ramda';

import { buildConditions } from '~/composables/conditions';
import type { ObjAddon } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';
import { useViewerStore } from '~/composables/store/viewer';

const $props = defineProps<{
  objId: string;
  index: number;
  addon: ObjAddon;
  display?: DisplaySettings;
  parentEnabled?: boolean;
}>();

const { selectedIds } = useProjectRefs();

const condition = computed(() => buildConditions($props.addon));
const isEnabled = computed(() => condition.value(selectedIds.value));

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
</script>

<style lang="scss">
.addon {
  padding: 0.5em;
}
</style>
