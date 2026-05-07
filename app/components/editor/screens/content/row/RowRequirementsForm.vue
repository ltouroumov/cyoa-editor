<template>
  <div class="flex flex-col gap-2 grow">
    <IftaLabel>
      <InputNumber v-model="row.requirements.allowedChoices" />
      <label>Allowed Choices</label>
    </IftaLabel>
    <IftaLabel>
      <label>Display Condition</label>
      <div
        v-if="row.requirements.display"
        class="p-component p-inputtext flex flex-row gap-1 items-center"
      >
        <ConditionDisplayShort :term="row.requirements.display" />
        <IconButton
          severity="secondary"
          icon="iconify solar--pen-line-duotone"
          class="shrink-0"
          size="small"
          @click="doEditDisplayRequirements()"
        />
      </div>
      <div
        v-else
        class="p-component p-inputtext flex flex-row gap-1 items-center"
      >
        <div class="text-secondary grow">Always Visible</div>
        <IconButton
          severity="secondary"
          icon="iconify solar--add-circle-line-duotone"
          class="shrink-0"
          @click="doEditDisplayRequirements()"
        />
      </div>
    </IftaLabel>
    <IftaLabel>
      <label>Choice Condition</label>
      <div
        v-if="row.requirements.choices"
        class="p-component p-inputtext flex flex-row gap-1 items-center"
      >
        <ConditionDisplayShort :term="row.requirements.choices" />
        <IconButton
          severity="secondary"
          icon="iconify solar--pen-line-duotone"
          class="shrink-0"
          size="small"
          @click="doEditChoiceRequirements()"
        />
      </div>
      <div
        v-else
        class="p-component p-inputtext flex flex-row gap-1 items-center"
      >
        <div class="text-muted-color grow">Always Enabled</div>
        <IconButton
          severity="secondary"
          icon="iconify solar--add-circle-line-duotone"
          class="shrink-0"
          @click="doEditChoiceRequirements()"
        />
      </div>
    </IftaLabel>
  </div>
</template>

<script setup lang="ts">
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import { P, match } from 'ts-pattern';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import type { RowObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const LazyEditConditionModal = defineAsyncComponent(
  () => import('~/components/editor/modals/EditConditionModal.vue'),
);
const $dialog = useDialog();

const projectStore = useProjectStore();
const props = defineProps<{
  rowId: string;
}>();

const row = computed((): RowObject => {
  return projectStore.get(props.rowId, ObjectType.row)!;
});

const doEditDisplayRequirements = () => {
  $dialog.open(LazyEditConditionModal, {
    data: {
      term: row.value.requirements.display,
    },
    onClose: (
      options: DynamicDialogCloseOptions<
        { update: ConditionTerm } | { remove: true }
      >,
    ) => {
      match(options.data)
        .with({ update: P.select() }, (term: ConditionTerm) => {
          row.value.requirements.display = term;
        })
        .with({ remove: true }, () => {
          row.value.requirements.display = undefined;
        })
        .otherwise(() => {
          // no changes, the operation was cancelled
        });
    },
    props: {
      header: `Edit Requirements for ${row.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
    },
  });
};

const doEditChoiceRequirements = () => {
  $dialog.open(LazyEditConditionModal, {
    data: {
      term: row.value.requirements.choices,
    },
    onClose: (
      options: DynamicDialogCloseOptions<
        { update: ConditionTerm } | { remove: true }
      >,
    ) => {
      match(options.data)
        .with({ update: P.select() }, (term: ConditionTerm) => {
          row.value.requirements.choices = term;
        })
        .with({ remove: true }, () => {
          row.value.requirements.choices = undefined;
        })
        .otherwise(() => {
          // no changes, the operation was cancelled
        });
    },
    props: {
      header: `Edit Requirements for ${row.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
    },
  });
};
</script>

<style scoped lang="scss"></style>
