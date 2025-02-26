<template>
  <div class="flex gap-2" :class="{ 'flex-col': $props.vertical }">
    <span
      v-for="{ score, value } in activeScores"
      :key="score.id"
      class="flex score gap-1 flex-row"
    >
      <span
        v-if="score.beforeText"
        :class="$props.short ? ['d-none', 'd-sm-block'] : []"
        class="me-1"
      >
        {{ score.beforeText }}
      </span>
      <span class="score-text">{{ -value }}</span>
      <span v-if="score.afterText" class="score-text">{{
        score.afterText
      }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import type { PointType } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';

const $props = defineProps<{
  vertical?: boolean;
  short?: boolean;
}>();

const { selected, pointTypes, points } = useProjectRefs();

const activeScores = computed<{ score: PointType; value: number }[]>(() => {
  const scores: PointType[] = pointTypes.value;

  return R.pipe(
    R.filter(
      (score: PointType) =>
        R.isEmpty(score.activatedId) ||
        R.has(score.activatedId, selected.value),
    ),
    R.map((score) => ({ score, value: points.value[score.id] ?? 0 })),
  )(scores);
});
</script>
<style scoped lang="scss">
.backpackRender .score-text {
  font-weight: normal;
}
</style>
