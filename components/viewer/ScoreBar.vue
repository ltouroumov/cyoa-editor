<template>
  <nav class="navbar fixed-bottom navbar-dark bg-dark">
    <div class="container-fluid justify-content-center gap-5">
      <div class="scores">
        <span v-for="score in activeScores" :key="score.id" class="navbar-text">
          <span v-if="score.beforeText">{{ score.beforeText }}</span>
          <span>{{ score.startingSum }}</span>
          <span v-if="score.afterText">{{ score.afterText }}</span>
        </span>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import { PointType } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs } from '~/composables/store/viewer';

const viewerRefs = useViewerRefs();
const projectRefs = useProjectRefs();

const activeScores = computed(() => {
  const selected: string[] = viewerRefs.selected.value;
  const scores: PointType[] = projectRefs.scores.value;

  console.log('activeScores', scores, selected);

  return R.filter(
    (score: PointType) =>
      R.isEmpty(score.activatedId) || R.includes(score.activatedId, selected),
    scores,
  );
});
</script>
