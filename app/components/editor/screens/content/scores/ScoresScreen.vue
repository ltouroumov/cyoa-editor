<template>
  <DataView :value="scores" data-key="id">
    <template #list="{ items }">
      <div class="grid grid-cols-3 gap-2">
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
</template>

<script setup lang="ts">
import ScoreCard from '~/components/editor/screens/content/scores/ScoreCard.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import type { ProjectScore } from '~/composables/project/types/v2/score';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const scores = computed((): ProjectScore[] => {
  return Array.from(projectStore.scores.values());
});
</script>

<style scoped lang="scss"></style>
