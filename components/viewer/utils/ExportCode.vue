<template>
  <div class="export-code-wrapper">
    <div class="export-code">
      <textarea
        class="form-control export-code-input"
        placeholder="Nothing has been selected yet ..."
        :value="exportCode"
      />
      <div class="form-check form-switch">
        <input
          id="useNewStyleCodesSwitch"
          v-model="exportNewCodeStyle"
          class="form-check-input"
          type="checkbox"
          role="switch"
          checked
        />
        <label class="form-check-label" for="useNewStyleCodesSwitch">
          Use new style of build codes
        </label>
      </div>
      <button
        class="btn btn-outline-primary export-code-btn"
        :class="{ isCopied: isCodeCopied }"
        @click="copyExportCode"
      >
        <span v-if="isCodeCopied">Copied to Clipboard!</span>
        <span v-else>Copy to Clipboard</span>
      </button>
    </div>
    <div class="export-text">
      <textarea
        class="form-control export-text-input"
        placeholder="Nothing has been selected yet ..."
        :value="exportText"
      />
      <div class="flex export-text-toggle column-gap-4">
        <div class="form-check form-switch">
          <input
            id="sectionTitleSwitch"
            v-model="exportTextHeaders"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="sectionTitleSwitch">
            Add Section Titles
          </label>
        </div>
        <div class="form-check form-switch">
          <input
            id="includeAddonsSwitch"
            v-model="exportAddons"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="includeNotesSwitch">
            Add Active Addons to Export
          </label>
        </div>
      </div>
      <button
        class="btn btn-outline-primary export-text-btn"
        :class="{ isCopied: isTextCopied }"
        @click="copyExportText"
      >
        <span v-if="isTextCopied">Copied to Clipboard!</span>
        <span v-else>Copy to Clipboard</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useBackpackExport } from '~/composables/viewer/useBackpackExport';

const { createExportText, createExportCode } = useBackpackExport();

const exportNewCodeStyle = ref<boolean>(true);
const exportCode = computed<string>(() =>
  createExportCode({ legacy: !exportNewCodeStyle.value }),
);

const exportTextHeaders = ref<boolean>(false);
const exportAddons = ref<boolean>(false);
const exportText = computed<string>(() =>
  createExportText({
    exportAddons: exportAddons.value,
    exportHeaders: exportTextHeaders.value,
  }),
);

const isCodeCopied = ref(false);
function copyExportCode() {
  navigator.clipboard.writeText(exportCode.value);
  isCodeCopied.value = true;

  setTimeout(() => {
    isCodeCopied.value = false;
  }, 4000);
}

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
.export-code-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  // min-width: 500px;

  .export-code,
  .export-text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
