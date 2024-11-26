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
import * as R from 'ramda';
import { computed } from 'vue';

import { buildConditions } from '~/composables/conditions';
import type { Score } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';

const { score } = defineProps<{ score: Score }>();

const { selectedIds, getPointType } = useProjectRefs();

const condition = buildConditions(score);
const isEnabled = computed<boolean>(() => {
  const pointType = getPointType.value(score.id);
  return (
    condition(selectedIds.value) &&
    (R.isEmpty(pointType.activatedId) ||
      R.includes(pointType.activatedId, selectedIds.value))
  );
});
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
