<template>
  <div class="export-code">
    <Textarea
      class="export-code-input min-h-[6rem] grow"
      placeholder="Nothing has been selected yet ..."
      :value="exportCode"
    />
    <div class="flex flex-row gap-1">
      <ToggleSwitch
        v-model="exportNewCodeStyle"
        input-id="useNewStyleCodesSwitch"
      />
      <label for="useNewStyleCodesSwitch"> Use new style of build codes </label>
    </div>
    <Button
      variant="outlined"
      class="export-code-btn"
      :class="{ isCopied: isCodeCopied }"
      @click="copyExportCode"
    >
      <span v-if="isCodeCopied">Copied to Clipboard!</span>
      <span v-else>Copy to Clipboard</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useBackpackExport } from '~/composables/viewer/useBackpackExport';

const { createExportCode } = useBackpackExport();

const exportNewCodeStyle = ref<boolean>(true);
const exportCode = computed<string>(() =>
  createExportCode({ legacy: !exportNewCodeStyle.value }),
);

const isCodeCopied = ref(false);
function copyExportCode() {
  navigator.clipboard.writeText(exportCode.value);
  isCodeCopied.value = true;

  setTimeout(() => {
    isCodeCopied.value = false;
  }, 4000);
}
</script>

<style scoped lang="scss">
.export-code {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
