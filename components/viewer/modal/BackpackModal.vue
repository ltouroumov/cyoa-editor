<template>
  <ModalDialog :show="isBackpackVisible" @close="toggleBackpack(false)">
    <template #header>
      <h5 class="m-0">Choices</h5>
    </template>
    <template #default>
      <div class="pack-content flex-grow-1 bg-dark">
        <button
          type="button"
          class="btn btn-primary mb-3"
          @click="backpackToImage"
        >
          Download backpack as Image
        </button>
        <div
          v-if="isLoading"
          class="d-flex align-items-center justify-content-start mb-3 gap-3 pt-3"
        >
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <strong>{{
            !progress
              ? 'Generating image... (This might take a while)'
              : progress
          }}</strong>
        </div>

        <div
          ref="backpackRef"
          class="backpack-container"
          :class="{ backpackRender: isLoading }"
        >
          <div class="pack-info-container">
            <div class="pack-scores">
              <ViewScoreStatus vertical />
            </div>
            <div class="d-flex flex-column pack-selection-controls">
              <div class="form-check form-switch">
                <input
                  id="packRowDisabledSwitch"
                  v-model="lockBackpackObjects"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                />
                <label class="form-check-label" for="packRowDisabledSwitch">
                  Lock Objects in the Backpack
                </label>
              </div>
              <div class="form-check form-switch">
                <input
                  id="hideDisabledAddons"
                  v-model="hideDisabledAddons"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                />
                <label class="form-check-label" for="hideDisabledAddons">
                  Hide Disabled Addons
                </label>
              </div>
            </div>
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
                  :view-object="objectMode"
                  :hide-disabled-addons="hideDisabledAddons"
                />
              </div>
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
import { domToDataUrl } from 'modern-screenshot';
import * as R from 'ramda';
import { computed } from 'vue';

import ModalDialog from '~/components/utils/ModalDialog.vue';
import ExportCode from '~/components/viewer/utils/ExportCode.vue';
import ImportCode from '~/components/viewer/utils/ImportCode.vue';
import { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';
import { ViewContext } from '~/composables/viewer';

const { getObject, getObjectRow, getRow, project } = useProjectStore();
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
const hideDisabledAddons = ref(true);
const lockBackpackObjects = ref(true);
const objectMode = computed(() => {
  if (lockBackpackObjects.value) return ViewContext.BackpackDisabled;
  else return ViewContext.BackpackEnabled;
});

const backpackRef = ref<HTMLDivElement>();
const isLoading = ref(false);
const progress = ref<string | null>(null);
const backpackToImage = async () => {
  if (backpackRef.value && packRows.value.length >= 1) {
    isLoading.value = true;
    // A hack, the DOM won't update until after html2canvas is called otherwise
    const pause = new Promise((resolve) => setTimeout(resolve, 100));
    await pause;
    const url = await domToDataUrl(backpackRef.value, {
      backgroundColor: project?.data.styling.backgroundColor,
      width: 1280,
      async progress(current: number, total: number) {
        await nextTick(() => {
          progress.value = `Downloading images... ${Math.round(
            (current / total) * 100,
          )}%`;
        });
      },
    });
    progress.value = null;
    isLoading.value = false;
    const element = document.createElement('a');
    element.href = url;
    element.download = `backpack-${new Date().toLocaleString()}.png`;

    await nextTick(() => {
      element.click();
    });

    URL.revokeObjectURL(url);
    element.remove();
  } else if (packRows.value.length === 0) {
    alert(
      'No objects selected to create a backpack image, select at least one object to create a image.',
    );
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

  .pack-info-container {
    display: flex;
    position: relative;

    .pack-scores {
      margin-bottom: 0.5rem;
    }

    .pack-selection-controls {
      position: absolute;
      right: 0;
      padding-right: 0.5rem;
    }
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

.backpackRender {
  width: 1280px !important;
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

  .pack-content .pack-info-container {
    flex-direction: column;
    align-items: flex-start;

    .pack-selection-controls {
      position: unset;
    }
  }
}
</style>
