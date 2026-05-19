<template>
  <Fluid>
    <div class="flex flex-col gap-2 justify-stretch">
      <div class="flex flex-row gap-2">
        <IftaLabel class="grow">
          <InputText v-model.lazy="score.title" />
          <label>Name</label>
        </IftaLabel>
        <IftaLabel>
          <InputText v-model="score.id" disabled />
          <label>ID</label>
        </IftaLabel>
      </div>
      <div class="flex flex-col gap-2">
        <IftaLabel>
          <InputNumber v-model="score.defaultValue" />
          <label>Value</label>
        </IftaLabel>
        <IftaLabel>
          <InputText v-model="score.unit" />
          <label>Unit</label>
        </IftaLabel>
        <IftaLabel>
          <label>Display Condition</label>
          <div
            v-if="score.activeWhen"
            class="p-component p-inputtext flex flex-row gap-1 items-center"
          >
            <ConditionDisplayShort :term="score.activeWhen" />
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
      </div>
    </div>
  </Fluid>
</template>

<script setup lang="ts">
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import { P, match } from 'ts-pattern';

import { useDraftScore } from '~/composables/editor/draft/useDraftScore';
import type { ConditionTerm } from '~/composables/project/types/v2/condition';

const LazyEditConditionModal = defineAsyncComponent(
  () => import('~/components/editor/modals/EditConditionModal.vue'),
);
const $dialog = useDialog();

const props = defineProps<{ scoreId: string }>();

const score = useDraftScore(() => props.scoreId);

const doEditDisplayRequirements = () => {
  $dialog.open(LazyEditConditionModal, {
    data: {
      term: score.value.activeWhen,
    },
    onClose: (
      options: DynamicDialogCloseOptions<
        { update: ConditionTerm } | { remove: true }
      >,
    ) => {
      match(options.data)
        .with({ update: P.select() }, (term: ConditionTerm) => {
          score.value.activeWhen = term;
        })
        .with({ remove: true }, () => {
          score.value.activeWhen = undefined;
        })
        .otherwise(() => {});
    },
    props: {
      header: `Edit Requirements for ${score.value.title}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};
</script>

<style scoped lang="scss"></style>
