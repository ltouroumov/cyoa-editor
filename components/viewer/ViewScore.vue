<template>
  <div class="obj-score" :class="{ disabled: !isEnabled }">
    {{
      score.beforeText +
      ' ' +
      Math.abs(Number.parseInt(score.value)) +
      ' ' +
      score.afterText
    }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { buildConditions } from '~/composables/conditions';
import type { Score } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';

const { score } = defineProps<{ score: Score }>();

const { selectedIds } = useProjectRefs();

const condition = buildConditions(score);
const isEnabled = computed<boolean>(() => condition(selectedIds.value));
</script>

<style lang="scss">
.obj-score {
  display: flex;
  flex-direction: row;
  gap: 5px;

  &.disabled {
    color: darkgray;
    display: none !important;
  }
}
</style>
