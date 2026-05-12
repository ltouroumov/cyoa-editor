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

const LazyEditConditionModal = defineAsyncComponent(
  () => import('~/components/editor/modals/EditConditionModal.vue'),
);
const $dialog = useDialog();

const row = defineModel<RowObject>({ required: true });

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
        .otherwise(() => {});
    },
    props: {
      header: `Edit Requirements for ${row.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
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
        .otherwise(() => {});
    },
    props: {
      header: `Edit Requirements for ${row.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};
</script>

<style scoped lang="scss"></style>
