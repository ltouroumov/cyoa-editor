<template>
  <div class="flex flex-col gap-2 border border-surface-700 rounded p-2">
    <div class="text-md text-primary font-bold">Scores</div>
    <div class="flex flex-col gap-2">
      {{ component }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  ComponentType,
  type ScoresComponent,
} from '~/composables/project/types/v2/objects/components/choice';
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
</script>

<style scoped lang="scss"></style>
