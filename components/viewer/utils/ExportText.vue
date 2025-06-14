<template>
  <div class="export-text">
    <Textarea
      class="export-text-input min-h-[6rem] grow"
      placeholder="Nothing has been selected yet ..."
      :value="exportText"
    />
    <div class="flex md:flex-row flex-col export-text-toggle md:gap-5 gap-1">
      <div class="flex flex-row gap-1">
        <ToggleSwitch
          v-model="exportTextHeaders"
          input-id="sectionTitleSwitch"
        />
        <label for="sectionTitleSwitch"> Add Section Titles </label>
      </div>
      <div class="flex flex-row gap-1">
        <ToggleSwitch v-model="exportAddons" input-id="includeAddonsSwitch" />
        <label for="includeAddonsSwitch"> Add Active Addons to Export </label>
      </div>
    </div>
    <Button
      variant="outlined"
      class="export-text-btn"
      :class="{ isCopied: isTextCopied }"
      @click="copyExportText"
    >
      <span v-if="isTextCopied">Copied to Clipboard!</span>
      <span v-else>Copy to Clipboard</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useBackpackExport } from '~/composables/viewer/useBackpackExport';

const { createExportText } = useBackpackExport();

const exportTextHeaders = ref<boolean>(true);
const exportAddons = ref<boolean>(true);
const exportText = computed<string>(() =>
  createExportText({
    exportAddons: exportAddons.value,
    exportHeaders: exportTextHeaders.value,
  }),
);

const isTextCopied = ref(false);
function copyExportText() {
  navigator.clipboard.writeText(exportText.value);
  isTextCopied.value = true;

  setTimeout(() => {
    isTextCopied.value = false;
  }, 4000);
}
</script>

<style scoped lang="scss">
.export-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
