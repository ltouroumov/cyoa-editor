<template>
  <div class="flex flex-col">
    <div v-if="isNotNil(object)">
      <div class="flex flex-col gap-2">
        <label>Condition Type</label>
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
      <div class="flex flex-col gap-2">
        <label>Condition Mode</label>
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
  </div>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import {
  ConditionMode,
  ConditionType,
  type ObjectCondition,
} from '~/composables/project/types/v2/objects/components/condition';

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
</script>

<style scoped lang="scss"></style>
