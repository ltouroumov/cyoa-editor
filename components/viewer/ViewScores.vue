<template>
  <div v-if="obj.scores.length > 0" class="obj-scores">
    <div v-for="(score, idx) in obj.scores" :key="idx" class="obj-score">
      <span v-if="score.beforeText" class="score-before">{{
        score.beforeText
      }}</span>
      <span class="score-value">{{ score.value }}</span>
      <span v-if="score.afterText" class="score-after">{{
        score.afterText
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProjectObj } from '~/composables/project';

defineProps<{ obj: ProjectObj }>();
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
