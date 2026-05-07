<template>
  <div class="min-w-[60vw] min-h-[60vh] flex flex-col">
    <div class="flex flex-col gap-2 flex-1">
      <EditCondition
        title="Edit Condition"
        :condition="object"
        @update="(condition) => updateCondition(condition)"
      />
      <div class="flex-1"></div>
      <div class="flex flex-row justify-end gap-2">
        <Button severity="secondary" @click="handleCancel()">Cancel</Button>
        <Button severity="primary" @click="handleSave()">Save</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNil, isNotNil } from 'ramda';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';

type DialogInput = { term: ConditionTerm };
type DialogResult = { update: ConditionTerm } | { remove: true };
type DialogProps = {
  data: DialogInput;
  close(result: DialogResult | null): void;
};
const dialogRef = inject<Ref<DialogProps>>('dialogRef');
const object = ref<ConditionTerm | undefined>(undefined);

onMounted(() => {
  const { term } = dialogRef?.value?.data ?? {};
  if (term) {
    object.value = term;
  }
});

const updateCondition = (condition: ConditionTerm | undefined) => {
  object.value = condition;
};

const handleSave = () => {
  if (isNil(dialogRef?.value)) return;
  const closeFn = dialogRef.value.close;

  if (isNotNil(object.value)) {
    closeFn({ update: object.value });
  } else {
    closeFn({ remove: true });
  }
};

const handleCancel = () => {
  dialogRef?.value?.close(null);
};
</script>

<style scoped lang="scss"></style>
