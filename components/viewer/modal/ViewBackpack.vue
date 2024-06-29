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
          <textarea class="export-code form-control" :value="exportCode" />
          <button
            class="export-btn btn btn-outline-primary"
            @click="copyExportCode"
          >
            Copy to Clipboard
          </button>
          <textarea v-model="importCode" class="import-code form-control" />
          <button
            class="import-btn btn btn-outline-primary"
            @click="readImportCode"
          >
            Import Build
          </button>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import ModalDialog from '~/components/utils/ModalDialog.vue';
import { ProjectObj, ProjectRow } from '~/composables/project';
import {
  Selections,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { getObject, getObjectRow, getRow } = useProjectStore();
const { selected, selectedIds, backpack } = useProjectRefs();
const { toggleBackpack } = useViewerStore();
const { isBackpackVisible } = useViewerRefs();

const packRows = computed(() => {
  const selectedChoices = R.map(
    (id: string) => ({ obj: getObject(id), row: getRow(getObjectRow(id)) }),
    selectedIds.value,
  );
  const choicesByGroup: Partial<
    Record<string, { obj: ProjectObj; row: ProjectRow }[]>
  > = R.groupBy(({ row }) => row.resultGroupId, selectedChoices);

  return R.chain(
    (row: ProjectRow) =>
      row.resultGroupId in choicesByGroup
        ? [{ packRow: row, choices: choicesByGroup[row.resultGroupId] }]
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

function copyExportCode() {
  navigator.clipboard.writeText(exportCode.value);
}

const LEGACY_RX = /^(\w+(\/ON#\d+)?)(,(\w+(\/ON#\d+)?))*$/;
function readImportCode() {
  const _code = importCode.value;
  console.log(`Import Code ${_code}`);
  if (!_code) return;

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
    'in-txt out-txt' auto
    'in-btn out-btn' auto
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
  .import-btn {
    grid-area: in-btn;
  }
  .export-btn {
    grid-area: out-btn;
  }
}
</style>
