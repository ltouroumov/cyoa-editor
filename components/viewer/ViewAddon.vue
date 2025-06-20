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
import { ref, watch } from 'vue';

import { buildConditions } from '~/composables/conditions';
import type { ObjAddon } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';

const { addon } = defineProps<{ addon: ObjAddon; display?: DisplaySettings }>();

const { selectedIds } = useProjectRefs();

const condition = buildConditions(addon);
const isEnabled = ref<boolean>(condition(selectedIds.value));
watch(selectedIds, (newSelection) => {
  isEnabled.value = condition(newSelection);
});
</script>

<style lang="scss">
.addon {
  padding: 0.5em;
}
</style>
