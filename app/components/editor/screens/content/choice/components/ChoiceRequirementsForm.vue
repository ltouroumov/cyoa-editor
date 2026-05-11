<template>
  <div class="flex flex-col gap-2 border border-surface-700 rounded p-2">
    <div class="text-md text-primary font-bold">Requirements</div>
    <div class="flex flex-col gap-2 grow">
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
            <span v-if="requirement.hidden" class="text-surface-500">
              Hidden
            </span>
            <ButtonGroup>
              <IconButton
                outlined
                icon="iconify solar--arrow-up-line-duotone"
                size="small"
                severity="secondary"
                @click="moveRequirement(requirement.id, 'up')"
              />
              <IconButton
                outlined
                icon="iconify solar--arrow-down-line-duotone"
                size="small"
                severity="secondary"
                @click="moveRequirement(requirement.id, 'down')"
              />
            </ButtonGroup>
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
          @click="addRequirement()"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import {
  append,
  assoc,
  clone,
  find,
  findIndex,
  isNil,
  isNotNil,
  reject,
  swap,
  update,
} from 'ramda';

import IconButton from '~/components/utils/IconButton.vue';
import { ConditionTypes } from '~/composables/editor/const';
import { createId } from '~/composables/project/types/v2/id';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  ComponentType,
  type RequirementsComponent,
} from '~/composables/project/types/v2/objects/components/choice';
import {
  ConditionMode,
  ConditionType,
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
  const condIdx = findIndex(
    (cond) => cond.id === id,
    component.value.requirements,
  );
  if (condIdx === -1) return;

  $dialog.open(LazyEditRequirementModal, {
    data: {
      condition: clone(component.value.requirements[condIdx]),
    },
    onClose: (
      options: DynamicDialogCloseOptions<{ update: ObjectCondition }>,
    ) => {
      if (isNil(options.data)) return;

      component.value.requirements = update(
        condIdx,
        options.data.update,
        component.value.requirements,
      );
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

const DefaultCondition: Omit<ObjectCondition, 'id'> = {
  type: ConditionType.required,
  mode: ConditionMode.all,
  objectIds: [],
  hidden: true,
};

const addRequirement = () => {
  $dialog.open(LazyEditRequirementModal, {
    data: {
      condition: clone(assoc('id', createId(), DefaultCondition)),
    },
    onClose: (
      options: DynamicDialogCloseOptions<{ update: ObjectCondition }>,
    ) => {
      if (isNil(options.data)) return;

      component.value.requirements = append(
        options.data.update,
        component.value.requirements,
      );
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
  component.value.requirements = reject(
    (cond) => cond.id === id,
    component.value.requirements,
  );
};

const moveRequirement = (id: string, direction: 'up' | 'down') => {
  const scoreIdx = findIndex(
    (cond) => cond.id === id,
    component.value.requirements,
  );

  if (scoreIdx === -1) return;

  const destIdx = direction === 'up' ? scoreIdx - 1 : scoreIdx + 1;

  if (destIdx < 0 || destIdx >= component.value.requirements.length) return;

  component.value.requirements = swap(
    scoreIdx,
    destIdx,
    component.value.requirements,
  );
};
</script>

<style scoped lang="scss"></style>
