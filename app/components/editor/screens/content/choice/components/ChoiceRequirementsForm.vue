<template>
  <div class="flex flex-col gap-2 border border-surface-700 rounded p-2">
    <div class="text-md text-primary font-bold">Requirements</div>
    <div class="flex flex-col gap-2">
      <div
        v-for="(requirement, index) in component.requirements"
        :key="requirement.id"
        class="flex flex-col"
        :class="{ 'border-t border-surface-700 pt-2': index > 0 }"
      >
        <div class="flex flex-row justify-between">
          <div class="flex flex-row gap-1 items-start">
            <span class="font-bold">
              {{ getConditionTypeLabel(requirement.type) }}
            </span>
            <span class="italic">{{ requirement.mode }}</span>
            <span class="flex flex-col gap-1">
              <span v-for="choiceId in requirement.objectIds" :key="choiceId">
                {{ getChoiceName(choiceId) }}
              </span>
            </span>
          </div>
          <div class="flex flex-row gap-1 items-center">
            <span v-if="isNotNil(requirement.activeWhen)">*</span>
            <span v-if="!requirement.display" class="text-surface-500">
              Hidden
            </span>
            <IconButton
              outlined
              severity="secondary"
              icon="iconify solar--pen-line-duotone"
              @click="editRequirement(requirement.id)"
            />
            <IconButton
              outlined
              severity="danger"
              icon="iconify solar--trash-bin-trash-line-duotone"
              @click="removeRequirement(requirement.id)"
            />
          </div>
        </div>
        <div v-if="isNotNil(requirement.activeWhen)" class="flex flex-row">
          <span class="italic shrink-0">Active When:&nbsp;</span>
          <ConditionDisplayShort :term="requirement.activeWhen" class="grow" />
        </div>
      </div>
    </div>
    <div class="flex flex-row border-t border-surface-700 pt-2">
      <div>
        <Select
          v-model="component.mode"
          class="w-36"
          option-label="label"
          option-value="value"
          size="small"
          :options="[
            { label: 'ANY (OR)', value: ConditionMode.any },
            { label: 'ALL (AND)', value: ConditionMode.all },
          ]"
        />
      </div>
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
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import { find, isNotNil } from 'ramda';

import IconButton from '~/components/utils/IconButton.vue';
import { ConditionTypes } from '~/composables/editor/const';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  ComponentType,
  type RequirementsComponent,
} from '~/composables/project/types/v2/objects/components/choice';
import {
  ConditionMode,
  type ConditionType,
  type ObjectCondition,
} from '~/composables/project/types/v2/objects/components/condition';
import { useProjectStore } from '~/composables/project/useProjectStore';

const LazyEditRequirementModal = defineAsyncComponent(
  () => import('~/components/editor/modals/EditRequirementModal.vue'),
);

const $dialog = useDialog();
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

const editRequirement = (id: string) => {
  $dialog.open(LazyEditRequirementModal, {
    data: {
      condition: component.value.requirements.find((cond) => cond.id === id),
    },
    onClose: (
      options: DynamicDialogCloseOptions<
        { update: ObjectCondition } | { remove: true }
      >,
    ) => {
      console.log(options.data);
    },
    props: {
      header: `Edit Requirement for ${choice.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};

const removeRequirement = (id: string) => {
  // TODO
};
</script>

<style scoped lang="scss"></style>
