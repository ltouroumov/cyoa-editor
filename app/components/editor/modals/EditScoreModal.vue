<template>
  <div class="flex flex-col gap-2">
    <template v-if="isNotNil(score)">
      <IftaLabel>
        <Select
          v-model="score.scoreId"
          :options="scores"
          option-label="label"
          option-value="value"
          fluid
        />
        <label>Score</label>
      </IftaLabel>
      <IftaLabel>
        <InputNumber v-model="score.value" fluid />
        <label>Value</label>
      </IftaLabel>

      <EditCondition
        :condition="score.activeWhen"
        title="Active When"
        :compact="true"
        @update="updateActiveWhen($event)"
      />

      <div class="flex flex-row justify-end gap-2">
        <Button severity="secondary" @click="close(undefined)">Cancel</Button>
        <Button @click="close({ update: score })">Save</Button>
      </div>
    </template>
    <Skeleton v-else height="30rem" />
  </div>
</template>

<script setup lang="ts">
import { isNil, isNotNil } from 'ramda';

import { useModalClient } from '~/components/editor/utils/useModalClient';
import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import type {
  ObjectScore,
  ProjectScore,
} from '~/composables/project/types/v2/score';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

type DialogInput = { score: ObjectScore };
type DialogResult = { update: ObjectScore };
const { data: score, close } = useModalClient<
  DialogInput,
  ObjectScore,
  DialogResult
>((input: DialogInput) => input.score);

function getScoreName(scoreId: string) {
  return projectStore.scores.get(scoreId)?.title ?? 'Unknown';
}

const scores = computed(() => {
  return Array.from(projectStore.scores.values()).map(
    (score: ProjectScore) => ({
      label: score.title,
      value: score.id,
    }),
  );
});

const updateActiveWhen = (newCondition: ConditionTerm | undefined) => {
  if (isNil(score.value)) return;
  score.value.activeWhen = newCondition;
};
</script>

<style scoped lang="scss"></style>
