<template>
  <div class="d-flex gap-1" :class="{ 'flex-column': vertical }">
    <span
      v-for="score in activeScores"
      :key="score.id"
      class="d-flex flex-row gap-2"
    >
      <span v-if="score.beforeText">{{ score.beforeText }}</span>
      <span>{{ score.startingSum }}</span>
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

const { selected, pointTypes } = useProjectRefs();

const activeScores = computed<PointType[]>(() => {
  const scores: PointType[] = pointTypes.value;

  return R.filter(
    (score: PointType) =>
      R.isEmpty(score.activatedId) ||
      R.includes(score.activatedId, selected.value),
    scores,
  );
});
</script>
