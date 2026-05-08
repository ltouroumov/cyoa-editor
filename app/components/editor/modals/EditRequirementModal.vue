<template>
  <div class="flex flex-col gap-2">
    <template v-if="isNotNil(object)">
      <div class="flex flex-row gap-2">
        <div class="flex flex-col gap-2 flex-1">
          <label class="text-primary">Condition Type</label>
          <SelectButton
            v-model="object.type"
            option-label="label"
            option-value="value"
            :options="[
              { label: 'Required', value: ConditionType.required },
              { label: 'Incompatible', value: ConditionType.incompatible },
            ]"
            fluid
          />
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <label class="text-primary">Condition Mode</label>
          <SelectButton
            v-model="object.mode"
            option-label="label"
            option-value="value"
            :options="[
              { label: 'ALL (AND)', value: ConditionMode.all },
              { label: 'ANY (OR)', value: ConditionMode.any },
            ]"
            fluid
          />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="text-primary font-bold">
          {{ getConditionTypeLabel(object.type) + ' Objects' }}
        </div>
        <div
          class="flex flex-col gap-2 p-2 bg-surface-900 border border-surface-700 font-mono"
        >
          <div
            v-for="objectId in object.objectIds"
            :key="objectId"
            class="flex flex-row gap-2"
          >
            <div
              class="bg-surface-800 px-2 py-1 rounded flex flex-row gap-2 items-center flex-1"
            >
              {{ getChoiceName(objectId) }}
            </div>
            <IconButton
              icon="iconify solar--trash-bin-trash-line-duotone"
              size="small"
              variant="text"
              severity="secondary"
              @click="$emit('remove')"
            />
          </div>
          <div class="flex flex-row items-center">
            <div class="border-t border-surface-600 grow my-2"></div>
            <div class="mx-2">
              <Button size="small" severity="secondary">
                <span class="iconify solar--add-circle-line-duotone"></span>
                Add
              </Button>
            </div>
            <div class="border-t border-surface-600 grow my-2"></div>
          </div>
        </div>
      </div>
      <div>
        <EditCondition
          :condition="object.activeWhen"
          title="Active When"
          @update="updateActiveWhen($event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { find, isNil, isNotNil } from 'ramda';

import { ConditionTypes } from '~/composables/editor/const';
import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  ConditionMode,
  ConditionType,
  type ObjectCondition,
} from '~/composables/project/types/v2/objects/components/condition';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

type DialogInput = { condition: ObjectCondition };
type DialogResult = { condition: ObjectCondition } | { remove: true };
type DialogProps = {
  data: DialogInput;
  close(result: DialogResult | null): void;
};
const dialogRef = inject<Ref<DialogProps>>('dialogRef');
const object = ref<ObjectCondition | undefined>(undefined);

onMounted(() => {
  const { condition } = dialogRef?.value?.data ?? {};
  if (condition) {
    object.value = condition;
  }
});

function getConditionTypeLabel(type: ConditionType): string {
  return find((ct) => ct.value === type, ConditionTypes)?.label ?? 'Unknown';
}

function getChoiceName(choiceId: string) {
  return projectStore.get(choiceId, ObjectType.choice)?.name ?? 'Unknown';
}

const updateActiveWhen = (newCondition: ConditionTerm | undefined) => {
  if (isNil(object.value)) return;
  object.value.activeWhen = newCondition;
};
</script>

<style scoped lang="scss"></style>
