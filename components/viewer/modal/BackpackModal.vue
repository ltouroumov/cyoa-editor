<template>
  <ModalDialog :show="isBackpackVisible" @close="toggleBackpack(false)">
    <template #header>
      <h5 class="m-0">Choices</h5>
    </template>
    <template #default>
      <div class="pack-content bg-dark flex-grow-1">
        <div class="pack-scores">
          <ViewScoreStatus vertical />
        </div>
        <div
          v-for="{ packRow, choices } in packRows"
          :key="packRow.id"
          class="pack-row"
        >
          <div class="pack-row-title">
            {{ packRow.title }}
          </div>
          <div class="container-fluid p-0">
            <div class="row g-2">
              <ViewProjectObj
                v-for="{ obj, row } in choices"
                :key="obj.id"
                :obj="obj"
                :row="row"
                :width="packRow.objectWidth"
                :can-toggle="false"
              />
            </div>
          </div>
        </div>
        <div class="pack-import-export">
          <strong>Import / Export</strong>
          <textarea
            v-model="importCode"
            class="import-code form-control"
            placeholder="Will delete all selected items if empty!!"
          />
          <button
            class="import-btn btn btn-outline-primary"
            @click="readImportCode"
          >
            Import Build
          </button>
          <textarea class="export-code form-control" :value="exportCode" />
          <button
            class="export-code-btn btn btn-outline-primary"
            :class="{ isCopied: isCodeCopied }"
            @click="copyExportCode"
          >
            <span v-if="isCodeCopied">Copied to Clipboard!</span>
            <span v-else>Copy to Clipboard</span>
          </button>
          <textarea class="export-text form-control" :value="exportText" />
          <div class="export-text-toggle form-check">
            <input
              v-model="exportTextHeaders"
              class="form-check-input"
              type="checkbox"
            />
            <label class="form-check-label">Add Section Titles</label>
          </div>
          <button
            class="export-text-btn btn btn-outline-primary"
            :class="{ isCopied: isTextCopied }"
            @click="copyExportText"
          >
            <span v-if="isTextCopied">Copied to Clipboard!</span>
            <span v-else>Copy to Clipboard</span>
          </button>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed, ref } from 'vue';

import ModalDialog from '~/components/utils/ModalDialog.vue';
import { ProjectObj, ProjectRow } from '~/composables/project';
import {
  Selections,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { getObject, getObjectRow, getRow } = useProjectStore();
const { selected, backpack } = useProjectRefs();
const { toggleBackpack } = useViewerStore();
const { isBackpackVisible } = useViewerRefs();

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

const importCode = ref<string>();
const exportCode = computed<string>(() => {
  return R.pipe(
    R.map(([id, amt]) => (amt > 1 ? `${id}:${amt}` : id)),
    R.join(';'),
  )(R.toPairs(selected.value));
});
const exportTextHeaders = ref<boolean>(false);
const exportText = computed<string>(() => {
  return R.pipe(
    R.map(({ packRow, choices }: PackRow): string => {
      const choiceTitles = R.map(({ obj, count }) => {
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

const LEGACY_RX = /([a-zA-Z0-9-]+)(?:\/ON#|:)?(\d*)/g;
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

<style lang="scss">
.pack-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em;
}

.pack-content {
  overflow-x: hidden;
  overflow-y: auto;

  .pack-scores {
    margin-bottom: 0.5rem;
  }

  .pack-row {
    padding: 0;
    margin-bottom: 0.5rem;

    .pack-row-title {
      font-size: 1.2rem;
      font-weight: bolder;
      text-align: center;
      margin-bottom: 0.2rem;
    }

    .choice {
      padding-left: 0;
      padding-right: 0;
    }
  }
}

.pack-import-export {
  display: grid;
  gap: 0.5rem;
  grid-template:
    'head head' auto
    'in-txt out-txt' 1fr
    'in-btn out-btn' auto
    'list-txt list-txt' 2fr
    'list-tgl list-btn' auto
    / 1fr 1fr;

  strong {
    grid-area: head;
    display: block;
    text-align: center;
  }
  .import-code {
    grid-area: in-txt;
  }
  .export-code {
    grid-area: out-txt;
  }
  .export-text {
    grid-area: list-txt;
  }
  .import-btn {
    grid-area: in-btn;
  }
  .export-code-btn {
    grid-area: out-btn;
  }
  .export-text-btn {
    grid-area: list-btn;
  }
  .export-text-toggle {
    grid-area: list-tgl;
    justify-self: end;
    align-self: center;
  }
  .isCopied {
    color: white;
    background-color: green;
  }
}
</style>
