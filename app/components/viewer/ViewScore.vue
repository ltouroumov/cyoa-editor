<template>
  <div class="obj-score" :class="{ disabled: !isEnabled }">
    {{ score.beforeText + ' ' + displayValue + ' ' + score.afterText }}
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { isNotNil } from 'ramda';
import { computed } from 'vue';

import { buildConditions } from '~/composables/conditions';
import type { Score } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import { applyScoreSign } from '~/composables/viewer/scoreSign';

const { score } = defineProps<{ score: Score }>();

const { selectedIds, getPointType } = useProjectRefs();

const displayValue = computed<string>(() => {
  const raw = Number.parseInt(score.value) || 0;
  return applyScoreSign(raw, getPointType.value(score.id));
});

const condition = buildConditions(score);
const isEnabled = computed<boolean>(() => {
  const pointType = getPointType.value(score.id);
  return (
    condition(selectedIds.value) &&
    (isNotNil(pointType)
      ? R.isEmpty(pointType.activatedId) ||
        R.includes(pointType.activatedId, selectedIds.value)
      : true)
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
