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
      <div class="d-flex export-text-toggle column-gap-4">
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
import * as R from 'ramda';
import { computed, ref } from 'vue';

import type { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const { getObject, getObjectRow, getRow } = useProjectStore();
const { selected, selectedIds, backpack } = useProjectRefs();

type PackRowChoice = { row: ProjectRow; obj: ProjectObj; count: number };
type PackRow = { packRow: ProjectRow; choices: PackRowChoice[] };
const packRows = computed(() => {
  const selectedChoices = R.map(
    ([id, count]): PackRowChoice => ({
      obj: getObject(id),
      row: getRow(getObjectRow(id)),
      count,
    }),
    R.toPairs(selected.value),
  );
  const choicesByGroup: Partial<Record<string, PackRowChoice[]>> = R.groupBy(
    ({ obj, row }) => R.head(obj.groups)?.id ?? row.resultGroupId,
    selectedChoices,
  );

  return R.chain(
    (row: ProjectRow): PackRow[] =>
      row.resultGroupId in choicesByGroup
        ? [{ packRow: row, choices: choicesByGroup[row.resultGroupId] ?? [] }]
        : [],
    backpack.value,
  );
});

const exportNewCodeStyle = ref<boolean>(true);
const exportCode = computed<string>(() => {
  const join = exportNewCodeStyle.value ? ';' : ',';

  return R.pipe(
    R.map(([id, amt]) => {
      if (exportNewCodeStyle.value) {
        return amt > 1 ? `${id}:${amt}` : id;
      } else {
        const object = getObject(id);
        return amt > 1 || object.isSelectableMultiple ? `${id}/ON#${amt}` : id;
      }
    }),
    R.join(join),
  )(R.toPairs(selected.value));
});
const exportTextHeaders = ref<boolean>(false);
const exportAddons = ref<boolean>(false);
const exportText = computed<string>(() => {
  return R.pipe(
    R.map(({ packRow, choices }: PackRow): string => {
      const choiceTitles = R.map(({ obj, count }) => {
        if (R.isNotEmpty(obj.addons) && exportAddons.value) {
          const activeAddons = R.filter((addon) => {
            const condition = buildConditions(addon);
            return condition(selectedIds.value);
          }, obj.addons);
          if (R.isNotEmpty(activeAddons)) {
            const addonTitles = R.map((addon) => addon.title, activeAddons);
            if (count > 1 || obj.isSelectableMultiple)
              return `${obj.title} x ${count} ( ${R.join(' , ', addonTitles)} )`;
            else return `${obj.title} ( ${R.join(' , ', addonTitles)} )`;
          }
        }
        if (count > 1 || obj.isSelectableMultiple)
          return `${obj.title} x ${count}`;
        else return obj.title;
      }, choices);
      if (exportTextHeaders.value) {
        return R.concat(`**${packRow.title}**\n`, R.join(', ', choiceTitles));
      } else {
        return R.join(', ', choiceTitles);
      }
    }),
    R.join(exportTextHeaders.value ? '\n' : ', '),
  )(packRows.value);
});

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
