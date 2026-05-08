<template>
  <div class="flex flex-col gap-2">
    <template v-if="isNotNil(object)">
      <div class="flex flex-row gap-2">
        <div class="flex flex-col gap-2 flex-1">
          <IftaLabel>
            <Select
              v-model="object.type"
              option-label="label"
              option-value="value"
              :options="[
                { label: 'Required', value: ConditionType.required },
                { label: 'Incompatible', value: ConditionType.incompatible },
              ]"
              fluid
            />
            <label>Condition Type</label>
          </IftaLabel>
          <IftaLabel class="flex flex-col gap-2 flex-1">
            <Select
              v-model="object.mode"
              option-label="label"
              option-value="value"
              :options="[
                { label: 'ALL (AND)', value: ConditionMode.all },
                { label: 'ANY (OR)', value: ConditionMode.any },
              ]"
              fluid
            />
            <label>Condition Mode</label>
          </IftaLabel>
          <IftaLabel class="flex flex-col gap-2 flex-1">
            <Select
              v-model="object.display"
              option-label="label"
              option-value="value"
              :options="[
                { label: 'Visible', value: true },
                { label: 'Hidden', value: false },
              ]"
              fluid
            />
            <label>Visibility</label>
          </IftaLabel>
        </div>

        <div class="flex flex-col gap-2 flex-1">
          <IftaLabel>
            <InputText v-model="object.beforeText" fluid />
            <label>Before Text</label>
          </IftaLabel>
          <IftaLabel>
            <InputText v-model="object.afterText" fluid />
            <label>After Text</label>
          </IftaLabel>
          <IftaLabel>
            <InputText v-model="object.termText" fluid />
            <label>After Choice Text</label>
          </IftaLabel>
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
              @click="removeRequirement(objectId)"
            />
          </div>
          <div class="flex flex-row items-center">
            <div class="border-t border-surface-600 grow my-2"></div>
            <div class="mx-2">
              <Button size="small" severity="secondary" @click="addRequirement">
                <span class="iconify solar--add-circle-line-duotone"></span>
                Add
              </Button>
            </div>
            <div class="border-t border-surface-600 grow my-2"></div>
          </div>
        </div>
      </div>
      <EditCondition
        :condition="object.activeWhen"
        title="Active When"
        :compact="true"
        @update="updateActiveWhen($event)"
      />
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
            <div class="inline-flex flex-row flex-wrap gap-1 text-wrap">
              <span>
                {{
                  isNotNil(object.beforeText) && isNotEmpty(object.beforeText)
                    ? object.beforeText
                    : getConditionTypeLabel(object.type)
                }}:
              </span>
              <span
                v-for="(objectId, idx) in object.objectIds"
                :key="objectId"
                class="inline-flex flex-row gap-0 text-wrap"
              >
                <span>{{ getChoiceName(objectId) }}</span>
                <span
                  v-if="
                    isNotNil(object.termText) && isNotEmpty(object.termText)
                  "
                  class="ms-1"
                >
                  {{ object.termText }}
                </span>
                <span v-if="idx < object.objectIds.length - 1">, </span>
              </span>
              <span
                v-if="
                  isNotNil(object.afterText) && isNotEmpty(object.afterText)
                "
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
      <div class="flex flex-row justify-end gap-2">
        <Button severity="secondary" @click="close(undefined)">Cancel</Button>
        <Button @click="close({ update: object })">Save</Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import { append, find, isNil, isNotEmpty, isNotNil, reject } from 'ramda';

import { useModalClient } from '~/components/editor/utils/useModalClient';
import { ConditionTypes } from '~/composables/editor/const';
import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  ConditionMode,
  ConditionType,
  type ObjectCondition,
} from '~/composables/project/types/v2/objects/components/condition';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $dialog = useDialog();
const projectStore = useProjectStore();

const LazyPickChoiceModal = defineAsyncComponent(
  () => import('~/components/editor/modals/PickChoiceModal.vue'),
);

type DialogInput = { condition: ObjectCondition };
type DialogResult = { update: ObjectCondition };
const { data: object, close } = useModalClient<
  DialogInput,
  ObjectCondition,
  DialogResult
>((input: DialogInput) => input.condition);

const previewSize = ref<string>('w-full');

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

const removeRequirement = (objectId: string) => {
  if (isNil(object.value)) return;
  object.value.objectIds = reject(
    (reqId) => reqId === objectId,
    object.value.objectIds,
  );
};

const addRequirement = () => {
  if (isNil(object.value)) return;
  $dialog.open(LazyPickChoiceModal, {
    onClose: (options: DynamicDialogCloseOptions<string | undefined>) => {
      if (isNil(object.value)) return;
      if (isNotNil(options.data)) {
        object.value.objectIds = append(options.data, object.value.objectIds);
      }
    },
    props: {
      header: `Add Requirements`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};
</script>

<style scoped lang="scss"></style>
