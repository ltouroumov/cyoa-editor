<template>
  <div class="import-code-wrapper">
    <Textarea
      v-model="importCode"
      class="import-code grow min-h-[6rem]"
      placeholder="Will delete all selected items if empty!!"
    />
    <Button
      class="import-btn"
      variant="outlined"
      @click="readImportCode($event)"
    >
      Import Build
    </Button>
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { isNotEmpty } from 'ramda';
import { ref } from 'vue';

import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useBackpackImport } from '~/composables/viewer/useBackpackImport';

const $confirm = useConfirm();
const $toast = useToast();
const { selected, buildNotes } = useProjectRefs();
const { setSelected } = useProjectStore();
const { readImportCode: parseImportCode } = useBackpackImport();
const importCode = ref<string>();

function readImportCode($event: any) {
  const result = parseImportCode(importCode.value);

  if (!result) {
    if (isNotEmpty(selected.value)) {
      $confirm.require({
        header: 'Clear choices?',
        message: 'There are currently selected choices.',
        icon: 'pi pi-exclamation-triangle',
        group: 'modal',
        rejectProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true,
        },
        acceptProps: {
          label: 'Clear Choices',
        },
        accept: async () => {
          selected.value = {};
          $toast.add({
            severity: 'info',
            summary: `Build Cleared`,
            life: 1000,
          });
        },
      });
    }
    return;
  }

  if (isNotEmpty(selected.value)) {
    $confirm.require({
      header: 'Load this build?',
      message: 'There are choices already selected.',
      icon: 'pi pi-exclamation-triangle',
      group: 'modal',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: 'Import',
      },
      accept: async () => {
        setSelected(result.selections, true, true);
        if (result.notes) {
          buildNotes.value = result.notes;
        }
        importCode.value = '';
        $toast.add({
          severity: 'info',
          summary: `Build code loaded`,
          life: 1000,
        });
      },
    });
  } else {
    setSelected(result.selections, true, true);
    if (result.notes) {
      buildNotes.value = result.notes;
    }
    importCode.value = '';
    $toast.add({
      severity: 'info',
      summary: `Build code loaded`,
      life: 1000,
    });
  }
}
</script>

<style scoped lang="scss">
.import-code-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  // min-width: 500px;
}
</style>
