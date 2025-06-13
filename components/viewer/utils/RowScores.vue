<template>
  <div class="row-scores" :class="{ horizontal: props.horizontal ?? false }">
    <span
      v-for="{ score, values } in rowScores"
      :key="score.id"
      class="row-score-item"
    >
      {{ values }} {{ score.afterText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { join, map, toPairs } from 'ramda';

import { useProjectStore } from '~/composables/store/project';
import type { ScoreAcc } from '~/composables/viewer/usePoints';

const store = useProjectStore();

const props = defineProps<{
  scores: Record<string, ScoreAcc>;
  horizontal?: boolean;
}>();

const rowScores = computed(() => {
  return map(([scoreId, value]) => {
    const score = store.getPointType(scoreId);
    const values: string[] = [];
    if (value.gain > 0) {
      values.push(`+${value.gain}`);
    }
    if (value.cost > 0) {
      values.push(`-${value.cost}`);
    }
    return {
      score: score,
      values: join(', ', values),
    };
  }, toPairs(props.scores));
});
</script>

<style scoped lang="scss">
.row-scores {
  font-size: smaller;
  color: gray;
  font-family: monospace;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &.horizontal {
    flex-direction: row;
  }
}
.row-score-item {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
</style>
