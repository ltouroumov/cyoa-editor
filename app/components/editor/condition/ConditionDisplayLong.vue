<template>
  <div>
    <div v-if="isAllOfTerm(term)" class="flex flex-row gap-2">
      <div class="flex flex-col items-center">
        <div class="border-l border-surface-700 grow"></div>
        <div>All</div>
        <div class="border-l border-surface-700 grow"></div>
      </div>
      <div class="flex flex-col gap-1">
        <ConditionDisplay
          v-for="(child, index) in term.allOf"
          :key="index"
          :term="child"
          :class="{
            'border-t border-surface-700': index !== 0,
            'pt-1': index === 0,
          }"
        />
      </div>
    </div>
    <div v-if="isAnyOfTerm(term)" class="flex flex-row gap-2">
      <div class="flex flex-col items-center">
        <div class="border-l border-surface-700 grow"></div>
        <div>Any</div>
        <div class="border-l border-surface-700 grow"></div>
      </div>
      <div class="flex flex-col gap-1">
        <ConditionDisplay
          v-for="(child, index) in term.anyOf"
          :key="index"
          :term="child"
          :class="{
            'border-t border-surface-700': index !== 0,
            'pt-1': index === 0,
          }"
        />
      </div>
    </div>
    <div v-if="isSelectedTerm(term)">
      Selected: <span>{{ getNameFor(term.isSelected) }}</span>
    </div>
    <div v-if="isNotSelectedTerm(term)">
      Not Selected: <span>{{ getNameFor(term.isNotSelected) }}</span>
    </div>
    <div v-if="isAlwaysTerm(term)">Always</div>
  </div>
</template>

<script setup lang="ts">
import {
  type ConditionTerm,
  isAllOfTerm,
  isAlwaysTerm,
  isAnyOfTerm,
  isNotSelectedTerm,
  isSelectedTerm,
} from '~/composables/project/types/v2/condition';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

const props = defineProps<{
  term: ConditionTerm;
}>();

function getNameFor(id: string): string {
  return projectStore.get(id, ObjectType.choice)?.name ?? '???';
}
</script>

<style scoped lang="scss"></style>
