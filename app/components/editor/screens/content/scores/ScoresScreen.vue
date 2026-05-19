<template>
  <div class="flex flex-row gap-2">
    <DataView :value="scores" data-key="id" class="grow">
      <template #list="{ items }">
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="item in items"
            :key="item.id"
            class="col-span-3 md:col-span-1"
          >
            <ScoreCard :score-id="item.id" />
          </div>
        </div>
      </template>
    </DataView>
    <div class="w-1/3">
      <div v-if="editScoreId" class="border-l border-surface-700 pl-2 h-full">
        <EditScoreScreen :score-id="editScoreId" />
      </div>
      <div
        v-else
        class="bg-surface-800 rounded p-4 h-full flex flex-row items-center justify-center"
      >
        <div class="text-sm text-muted-color">No Score Selected</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { last, prop } from 'ramda';

import ScoreCard from '~/components/editor/screens/content/scores/ScoreCard.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import type { ProjectScore } from '~/composables/project/types/v2/score';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const scores = computed((): ProjectScore[] => {
  return Array.from(projectStore.scores.values());
});

const editScoreId = computed(() => {
  const screen = last(editorStore.stack);
  if (prop('type', screen) === 'edit-score') {
    return screen.scoreId;
  } else {
    return undefined;
  }
});
</script>

<style scoped lang="scss"></style>
