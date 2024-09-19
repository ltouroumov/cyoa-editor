<template>
  <ModalDialog :show="isBackpackVisible" @close="toggleBackpack(false)">
    <template #header>
      <h5 class="m-0">Choices</h5>
    </template>
    <template #default>
      <div class="pack-content flex-grow-1 bg-dark">
        <div class="pack-scores">
          <ViewScoreStatus vertical />
        </div>
        <div
          v-for="{ packRow, choices } in packRows"
          :key="packRow.id"
          class="pack-row"
        >
          <div class="pack-row-title-container">
            <div class="pack-row-title">
              {{ packRow.title }}
            </div>
            <div class="form-check form-switch pack-row-controls">
              <input
                id="packRowDisabledSwitch"
                v-model="disabledPackRowSwitch[packRow.id]"
                class="form-check-input"
                type="checkbox"
                role="switch"
                @change="toggleRowSelectable(packRow)"
              />
              <label class="form-check-label" for="packRowDisabledSwitch">
                Disable Row
              </label>
            </div>
          </div>
          <div class="container-fluid p-0">
            <div v-if="!disabledSelected.includes(packRow.id)" class="row g-2">
              <ViewProjectObj
                v-for="{ obj, row } in choices"
                :key="obj.id"
                :obj="obj"
                :row="row"
                :width="packRow.objectWidth"
                :view-object="ViewContext.BackpackEnabled"
              />
            </div>
            <div v-else class="row g-2">
              <ViewProjectObj
                v-for="{ obj, row } in choices"
                :key="obj.id"
                :obj="obj"
                :row="row"
                :width="packRow.objectWidth"
                :view-object="ViewContext.BackpackDisabled"
              />
            </div>
          </div>
        </div>
        <div class="pack-import-export">
          <ImportCode />
          <ExportCode />
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import ModalDialog from '~/components/utils/ModalDialog.vue';
import ExportCode from '~/components/viewer/utils/ExportCode.vue';
import ImportCode from '~/components/viewer/utils/ImportCode.vue';
import { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';
import { ViewContext } from '~/composables/viewer';

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

const disabledSelected = ref<string[]>([]);
type PackRowSwitchStates = Record<string, boolean>;
const disabledPackRowSwitch = ref<PackRowSwitchStates>(
  R.reduce(
    (acc, obj) =>
      R.assoc(
        obj.packRow.id,
        R.includes(obj.packRow.id, disabledSelected.value),
        acc,
      ),
    {},
    packRows.value,
  ),
);
const toggleRowSelectable = (packRow: ProjectRow) => {
  if (R.includes(packRow.id, disabledSelected.value)) {
    disabledSelected.value = R.without([packRow.id], disabledSelected.value);
  } else {
    disabledSelected.value = R.concat(disabledSelected.value, [packRow.id]);
  }
};
</script>

<style scoped lang="scss">
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

    .pack-row-title-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }

    .pack-row-title {
      font-size: 1.2rem;
      font-weight: bolder;
      text-align: center;
      margin-bottom: 0.2rem;
      flex: 1;
    }

    .pack-row-controls {
      position: absolute;
      right: 0;
    }

    .choice {
      padding-left: 0;
      padding-right: 0;
    }
  }
}

.pack-import-export {
  display: flex;
  flex-direction: row;
  gap: 1rem;

  .import-code-wrapper {
    flex-grow: 1;
  }
  .export-code-wrapper {
    flex-grow: 1;
  }
}

@media screen and (max-width: 768px) {
  .pack-import-export {
    flex-direction: column;
  }

  .pack-row .pack-row-title-container {
    flex-direction: column;
    align-items: flex-start;

    .pack-row-controls {
      position: unset;
    }
  }
}
</style>
