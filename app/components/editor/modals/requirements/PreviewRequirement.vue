<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row items-center">
      <div class="text-primary font-bold grow">Preview</div>
      <div>
        <SelectButton
          v-model="previewSize"
          option-label="label"
          option-value="size"
          :options="[
            { label: 'Wide', size: 'w-full' },
            { label: 'Medium', size: 'w-1/2' },
            { label: 'Narrow', size: 'w-1/4' },
          ]"
        />
      </div>
    </div>
    <div
      class="flex flex-row border rounded border-surface-700 p-2 justify-center"
    >
      <div
        class="flex flex-col gap-2 p-2 border rounded-xl border-primary"
        :class="previewSize"
      >
        <div class="flex flex-row justify-center">
          <Skeleton animation="none" height="2rem" width="60%" />
        </div>
        <div class="text-wrap">
          <span>
            {{
              isNotNil(object.beforeText) && isNotEmpty(object.beforeText)
                ? object.beforeText
                : getConditionTypeLabel(object.type)
            }}:
          </span>
          <span v-for="(objectId, idx) in object.objectIds" :key="objectId">
            <span>{{ getChoiceName(objectId) }}</span>
            <span
              v-if="isNotNil(object.termText) && isNotEmpty(object.termText)"
              class="ms-1"
            >
              {{ object.termText }}
            </span>
            <span v-if="idx < object.objectIds.length - 1">, </span>
          </span>
          <span
            v-if="isNotNil(object.afterText) && isNotEmpty(object.afterText)"
          >
            {{ object.afterText }}
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <Skeleton animation="none" />
          <Skeleton animation="none" />
          <Skeleton animation="none" />
          <Skeleton animation="none" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { find, isNotEmpty, isNotNil } from 'ramda';

import { ConditionTypes } from '~/composables/editor/const';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import type {
  ConditionType,
  ObjectCondition,
} from '~/composables/project/types/v2/objects/components/condition';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

const $props = defineProps<{ object: ObjectCondition }>();
const previewSize = ref<string>('w-full');

function getConditionTypeLabel(type: ConditionType): string {
  return find((ct) => ct.value === type, ConditionTypes)?.label ?? 'Unknown';
}

function getChoiceName(choiceId: string) {
  return projectStore.get(choiceId, ObjectType.choice)?.name ?? 'Unknown';
}
</script>

<style scoped lang="scss"></style>
