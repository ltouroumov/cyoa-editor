<template>
  <div v-if="isNil(object)">no object</div>
  <div v-else-if="object.type === 'row'" class="flex flex-col gap-2">
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
  </div>
</template>

<script setup lang="ts">
import { assocPath, isNil, isNotNil } from 'ramda';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import type { AnyObject } from '~/composables/project/types/v2/objects';
import type { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $project = useProjectStore();

type DialogProps = { objectId: string; objectType: ObjectType };
const dialogRef = inject<Ref<{ data: DialogProps }>>('dialogRef');
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
</script>

<style scoped lang="scss"></style>
