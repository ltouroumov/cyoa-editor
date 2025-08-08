<template>
  <div class="addon" :class="{ disabled: !isEnabled }">
    <div class="title">{{ addon.title }}</div>
    <ViewRequirements
      v-if="!display?.hideAddonRequirements"
      :requireds="addon.requireds"
      :show-always="true"
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
import { buildConditions } from '~/composables/conditions';
import type { ObjAddon } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';

const $props = defineProps<{ addon: ObjAddon; display?: DisplaySettings }>();

const { selectedIds } = useProjectRefs();

const condition = computed(() => buildConditions($props.addon));
const isEnabled = computed(() => condition.value(selectedIds.value));
</script>

<style lang="scss">
.addon {
  padding: 0.5em;
}
</style>
