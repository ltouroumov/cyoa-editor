<template>
  <div class="d-flex gap-1" :class="{ 'flex-column': vertical }">
    <span
      v-for="{ score, value } in activeScores"
      :key="score.id"
      class="d-flex flex-row gap-2"
    >
      <span v-if="score.beforeText">{{ score.beforeText }}</span>
      <span>{{ -value }}</span>
      <span v-if="score.afterText">{{ score.afterText }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import { PointType } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';

const { vertical } = defineProps<{
  vertical?: boolean;
}>();

const { selected, pointTypes, points } = useProjectRefs();

const activeScores = computed<{ score: PointType; value: number }[]>(() => {
  const scores: PointType[] = pointTypes.value;

  return R.pipe(
    R.filter(
      (score: PointType) =>
        R.isEmpty(score.activatedId) ||
        R.includes(score.activatedId, selected.value),
    ),
    R.map((score) => ({ score, value: points.value[score.id] ?? 0 })),
  )(scores);
});
</script>
