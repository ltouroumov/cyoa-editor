<template>
  <div v-if="scores.length > 0" class="obj-scores">
    <ViewScore v-for="(score, idx) in scores" :key="idx" :score="score" />
  </div>
</template>

<script setup lang="ts">
import ViewScore from '~/components/viewer/ViewScore.vue';
import { Score } from '~/composables/project';

const { scores } = defineProps<{ scores: Score[] }>();
</script>

<style lang="scss">
.obj-scores {
  display: flex;
  flex-direction: column;
  align-items: center;

  .obj-score {
    display: flex;
    flex-direction: row;
    gap: 5px;
  }
}
</style>
