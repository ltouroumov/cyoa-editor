<template>
  <div class="min-w-[60vw] min-h-[60vh] flex flex-col">
    <div v-if="isNil(object)">no object</div>
    <div v-else-if="object.type === 'row'" class="flex flex-col gap-2 flex-1">
      <EditCondition
        title="Display Condition"
        :condition="object.requirements.display"
        @update="(condition) => setRowDisplay(condition)"
      />
      <EditCondition
        title="Choices Condition"
        :condition="object.requirements.choices"
        @update="(condition) => setRowChoices(condition)"
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
import { assocPath, isNil, isNotNil, omit } from 'ramda';
import { match } from 'ts-pattern';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import type {
  AnyObject,
  RowRequirements,
} from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $project = useProjectStore();

type DialogInput = { objectId: string; objectType: ObjectType };
type DialogResult = Omit<RowRequirements, 'allowedChoices'>;
type DialogProps = {
  data: DialogInput;
  close(result: DialogResult | null): void;
};
const dialogRef = inject<Ref<DialogProps>>('dialogRef');
const object = ref<AnyObject | undefined>(undefined);

onMounted(() => {
  const { objectId, objectType } = dialogRef?.value?.data ?? {};
  if (objectId && objectType) {
    console.log('Edit Requirements for', objectId, objectType);
    object.value = $project.get(objectId, objectType);
  }
});

const setRowDisplay = (condition: ConditionTerm | undefined) => {
  if (isNotNil(object.value) && object.value.type === 'row') {
    console.log('Setting row display condition:', condition);
    object.value = assocPath(
      ['requirements', 'display'],
      condition,
      object.value,
    );
  }
};

const setRowChoices = (condition: ConditionTerm | undefined) => {
  if (isNotNil(object.value) && object.value.type === 'row') {
    object.value = assocPath(
      ['requirements', 'choices'],
      condition,
      object.value,
    );
  }
};

const handleSave = () => {
  if (isNil(dialogRef?.value)) return;
  const closeFn = dialogRef.value.close;

  if (isNotNil(object.value) && object.value.type === 'row') {
    match(object.value)
      .with({ type: ObjectType.row }, (row) => {
        closeFn(omit(['allowedChoices'], row.requirements));
      })
      .otherwise(() => {
        closeFn(null);
      });
  }
};

const handleCancel = () => {
  dialogRef?.value?.close(null);
};
</script>

<style scoped lang="scss"></style>
