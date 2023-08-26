<template>
  <div class="obj-score" :class="{ disabled: !isEnabled }">
    <span v-if="score.beforeText" class="score-before">{{
      score.beforeText
    }}</span>
    <span class="score-value">{{
      Math.abs(Number.parseInt(score.value))
    }}</span>
    <span v-if="score.afterText" class="score-after">{{
      score.afterText
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { buildConditions } from '~/composables/conditions';
import { Score } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';

const { score } = defineProps<{ score: Score }>();

const { selected } = useProjectRefs();

const isEnabled = ref<boolean>(true);

if (score.requireds.length > 0) {
  const condition = buildConditions(score);
  isEnabled.value = condition(selected.value);

  watch(selected, (newSelection) => {
    isEnabled.value = condition(newSelection);
  });
}
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
