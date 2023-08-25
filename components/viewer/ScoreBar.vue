<template>
  <nav class="navbar fixed-bottom navbar-dark bg-dark">
    <div class="container-fluid justify-content-between">
      <div>
        <button class="btn btn-dark btn-lg i-solar-book-bold" />
      </div>
      <div class="d-flex gap-5">
        <span
          v-for="score in activeScores"
          :key="score.id"
          class="d-flex gap-2"
        >
          <span v-if="score.beforeText">{{ score.beforeText }}</span>
          <span>{{ score.startingSum }}</span>
          <span v-if="score.afterText">{{ score.afterText }}</span>
        </span>
      </div>
      <div class="d-flex gap-2">
        <span v-for="name in selectedNames">{{ name }}</span>
        <button class="btn btn-light btn-lg i-solar-backpack-outline" />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import { PointType } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const { getObject } = useProjectStore();
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

const selectedNames = computed(() =>
  R.map((id: string) => getObject(id)?.title, selected.value),
);
</script>
