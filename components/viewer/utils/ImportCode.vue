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
import * as R from 'ramda';
import { isNotEmpty } from 'ramda';
import { ref } from 'vue';

import type { Selections } from '~/composables/store/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const $confirm = useConfirm();
const $toast = useToast();
const { selected } = useProjectRefs();
const { setSelected } = useProjectStore();
const importCode = ref<string>();

const LEGACY_RX =
  /^(?:[a-zA-Z0-9-_!@&.]+(?:\/ON#\d+)?)(?:,[a-zA-Z0-9-_!@&.]+(?:\/ON#\d+)?)*$/;

function readImportCode($event: any) {
  let _code = importCode.value?.trim();

  if (!_code) {
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

  // Trim any trailing comma/semicolon, if present.
  if (_code.endsWith(',') || _code.endsWith(';')) {
    _code = _code.substring(0, _code.length - 1);
  }
  // Trim any leading comma/semicolon, if present.
  if (_code.startsWith(',') || _code.startsWith(';')) {
    _code = _code.substring(1);
  }

  const selections: Selections = {};
  if (LEGACY_RX.test(_code)) {
    console.log(`Legacy Import Mode`);
    R.split(',', _code).forEach((part) => {
      const sepIdx = part.indexOf('/ON#');
      if (sepIdx === -1) {
        selections[part] = 1;
      } else {
        const objId = part.substring(0, sepIdx);
        const amountS = part.substring(sepIdx + 4);
        selections[objId] = Number.parseInt(amountS);
      }
    });
  } else {
    R.split(';', _code).forEach((part) => {
      const sepIdx = part.indexOf(':');
      if (sepIdx === -1) {
        selections[part] = 1;
      } else {
        const [objId, amountS] = R.split(':', part);
        selections[objId] = Number.parseInt(amountS);
      }
    });
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
        setSelected(selections, true, true);
        importCode.value = '';
        $toast.add({
          severity: 'info',
          summary: `Build code loaded`,
          life: 1000,
        });
      },
    });
  } else {
    setSelected(selections, true, true);
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
