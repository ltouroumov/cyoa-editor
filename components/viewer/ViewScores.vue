<template>
  <div class="obj-scores" v-if="obj.scores.length > 0">
    <div class="obj-score" v-for="score in obj.scores">
      <span class="score-before" v-if="score.beforeText">{{ score.beforeText }}</span>
      <span class="score-value">{{ score.value }}</span>
      <span class="score-after" v-if="score.afterText">{{ score.afterText }}</span>
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