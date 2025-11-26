<template>
  <div class="flex flex-col gap-2 border border-surface-700 rounded p-2">
    <div class="text-md text-primary font-bold">Requirements</div>
    <div
      v-for="(requirement, index) in component.requirements"
      :key="requirement.id"
      class="flex flex-col"
      :class="{ 'border-t border-surface-700 pt-2': index > 0 }"
    >
      <div class="flex flex-row justify-between">
        <div class="flex flex-row gap-2 items-center">
          <span class="font-bold">{{
            getConditionTypeLabel(requirement.type)
          }}</span>
          <span>
            <span v-for="choiceId in requirement.objectIds" :key="choiceId">{{
              getChoiceName(choiceId)
            }}</span>
          </span>
        </div>
        <div class="flex flex-row gap-1 items-center">
          <span v-if="isNotNil(requirement.activeWhen)">*</span>
          <span v-if="!requirement.display" class="text-surface-500"
            >Hidden</span
          >
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
      <div v-if="isNotNil(requirement.activeWhen)">
        <span class="italic">Active When:&nbsp;</span>
        <ConditionDisplayShort :term="requirement.activeWhen" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { find, isNotNil } from 'ramda';

import IconButton from '~/components/utils/IconButton.vue';
import { ConditionTypes } from '~/composables/editor/const';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  ComponentType,
  type RequirementsComponent,
} from '~/composables/project/types/v2/objects/components/choice';
import type { ConditionType } from '~/composables/project/types/v2/objects/components/condition';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  choiceId: string;
}>();

const choice = computed((): ChoiceObject => {
  return projectStore.get(props.choiceId, ObjectType.choice)!;
});
const component = computed((): RequirementsComponent => {
  return choice.value.components[ComponentType.Requirements]!;
});

function getConditionTypeLabel(type: ConditionType): string {
  return find((ct) => ct.value === type, ConditionTypes)?.label ?? 'Unknown';
}

function getChoiceName(choiceId: string) {
  return projectStore.get(choiceId, ObjectType.choice)?.name ?? 'Unknown';
}
</script>

<style scoped lang="scss"></style>
