<template>
  <div class="import-code-wrapper">
    <textarea
      v-model="importCode"
      class="form-control import-code"
      placeholder="Will delete all selected items if empty!!"
    />
    <button class="btn btn-outline-primary import-btn" @click="readImportCode">
      Import Build
    </button>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { ref } from 'vue';

import { Selections, useProjectRefs } from '~/composables/store/project';

const { selected } = useProjectRefs();
const importCode = ref<string>();

const LEGACY_RX =
  /^(?:[a-zA-Z0-9-]+(?:\/ON#\d+)?)(?:,[a-zA-Z0-9-]+(?:\/ON#\d+)?)*$/;
function readImportCode() {
  const _code = importCode.value?.trim();
  console.log(`Import Code ${_code}`);
  if (!_code) {
    console.log(`No import code provided. Clearing Selections...`);
    selected.value = {};
    return;
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
  selected.value = selections;
  importCode.value = '';
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
