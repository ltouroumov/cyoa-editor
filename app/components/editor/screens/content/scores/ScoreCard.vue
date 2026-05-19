<template>
  <div class="border border-surface-500 flex flex-col p-2 rounded">
    <div class="flex flex-row gap-2">
      <div
        class="text-primary text-xl text-bold inline-flex items-center cursor-pointer grow gap-1"
        @click="editPage()"
      >
        <i class="iconify solar--card-2-line-duotone"></i>
        <span class="grow">{{ score.title }}</span>
        <span class="font-mono text-sm text-muted-color">
          {{ score.id }}
        </span>
      </div>
      <div class="flex flex-row gap-2 justify-end">
        <Button size="small" variant="outlined" severity="secondary">
          Clone
        </Button>
        <Button size="small" variant="outlined" severity="danger">
          Delete
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-1 text-sm text-muted-color">
      <div class="flex flex-row gap-2">
        <div class="inline-flex flex-row gap-1">
          <span class="font-bold">Initial Value:</span>
          <span>{{ score.defaultValue }}</span>
        </div>
        <div class="inline-flex flex-row gap-1">
          <span class="font-bold">Unit:</span>
          <span>{{ score.unit }}</span>
        </div>
      </div>
      <div class="inline-flex flex-row gap-1">
        <span class="font-bold">Condition:</span>
        <span v-if="isNotNil(score.activeWhen)">{{ score.activeWhen }}</span>
        <span v-else class="italic">Always Enabled</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import { useEditorStore } from '~/composables/editor/useEditorStore';
import type { ProjectScore } from '~/composables/project/types/v2/score';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const props = defineProps<{
  scoreId: string;
}>();

const score = computed((): ProjectScore => {
  return projectStore.scores.get(props.scoreId)!;
});

function editPage() {
  editorStore.pushScreen({
    type: 'edit-page',
    pageId: score.value.id,
  });
}
</script>

<style scoped lang="scss"></style>
