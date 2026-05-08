<template>
  <div class="flex flex-col gap-2 border border-surface-700 rounded p-2">
    <div class="text-md text-primary font-bold">Scores</div>
    <div class="flex flex-col gap-2 grow">
      <div
        v-for="(score, index) in component.scores"
        :key="score.scoreId"
        class="flex flex-col"
        :class="{ 'border-t border-surface-700 pt-2': index > 0 }"
      >
        <div class="flex flex-row items-center">
          <div class="flex flex-row gap-1 grow">
            <span class="font-bold">{{ getScoreTypeLabel(score.type) }}</span>
            <span>{{ score.value }}</span>
            <span>{{ getScoreName(score.scoreId) }}</span>
          </div>
          <div class="flex flex-row gap-1 items-center">
            <div class="flex flex-row gap-1 items-center">
              <span v-if="isNotNil(score.activeWhen)">*</span>
              <span v-if="score.hidden" class="text-surface-500">Hidden</span>
              <IconButton
                outlined
                severity="secondary"
                icon="iconify solar--pen-line-duotone"
              />
              <IconButton
                outlined
                severity="danger"
                icon="iconify solar--trash-bin-trash-line-duotone"
              />
            </div>
          </div>
        </div>
        <div v-if="isNotNil(score.activeWhen)" class="flex flex-row">
          <span class="italic shrink-0">Active When:&nbsp;</span>
          <ConditionDisplayShort :term="score.activeWhen" class="grow" />
        </div>
      </div>
    </div>

    <div class="flex flex-row border-t border-surface-700 pt-2">
      <div class="grow"></div>
      <div>
        <IconButton
          severity="secondary"
          icon="iconify solar--add-circle-line-duotone"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { find, isNotNil } from 'ramda';

import IconButton from '~/components/utils/IconButton.vue';
import { ScoreTypes } from '~/composables/editor/const';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  ComponentType,
  type ScoresComponent,
} from '~/composables/project/types/v2/objects/components/choice';
import type { ScoreType } from '~/composables/project/types/v2/score';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  choiceId: string;
}>();

const choice = computed((): ChoiceObject => {
  return projectStore.get(props.choiceId, ObjectType.choice)!;
});
const component = computed((): ScoresComponent => {
  return choice.value.components[ComponentType.Scores]!;
});

function getScoreTypeLabel(type: ScoreType): string {
  return find((ct) => ct.value === type, ScoreTypes)?.label ?? 'Unknown';
}

function getScoreName(scoreId: string) {
  return projectStore.scores.get(scoreId)?.title ?? 'Unknown';
}
</script>

<style scoped lang="scss"></style>
