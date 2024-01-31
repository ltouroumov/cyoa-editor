<template>
  <div class="obj-addon" :class="{ disabled: !isEnabled }">
    <div class="obj-title">{{ addon.title }}</div>
    <ViewRequirements :requireds="addon.requireds" />
    <div class="obj-text">{{ addon.text }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { buildConditions } from '~/composables/conditions';
import { ObjAddon } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';

const { addon } = defineProps<{ addon: ObjAddon }>();

const { selectedIds } = useProjectRefs();

const condition = buildConditions(addon);
const isEnabled = ref<boolean>(condition(selectedIds.value));
watch(selectedIds, (newSelection) => {
  isEnabled.value = condition(newSelection);
});
</script>

<style lang="scss">
.obj-addon {
  padding: 0.5em;
  border-top: 1px solid white;

  &.disabled {
    background: gray;
  }

  .obj-title {
    font-size: 1em;
    font-weight: bold;
  }
}
</style>
