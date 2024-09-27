<template>
  <ModalDialog
    :show="isBackpackVisible"
    size="modal-80"
    @close="toggleBackpack(false)"
  >
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
          ref="backpackRef"
          class="backpack-container"
          :class="{ backpackRender: isLoading }"
        >
          <div v-if="isLoading" class="project-title">
            {{ project?.projectName }}
          </div>
          <div class="pack-info-container">
            <div class="pack-scores">
              <ViewScoreStatus :vertical="!isLoading" />
            </div>
            <div
              v-show="!isLoading"
              class="flex-column pack-selection-controls"
            >
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
import { elementToSVG, inlineResources } from 'dom-to-svg';
import * as R from 'ramda';
import { computed } from 'vue';
import { useToast } from 'vue-toastification';

import ModalDialog from '~/components/utils/ModalDialog.vue';
import ExportCode from '~/components/viewer/utils/ExportCode.vue';
import ImportCode from '~/components/viewer/utils/ImportCode.vue';
import type { ProjectObj, ProjectRow } from '~/composables/project';
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
const backpackToImage = async () => {
  if (backpackRef.value && packRows.value.length >= 1) {
    isLoading.value = true;
    const $toast = useToast();
    const toastGenerateImage = $toast.info('Generating image...', {
      timeout: false,
    });
    // Wait for the next tick to ensure DOM is updated before getting the element.
    await nextTick();

    // Set background color for svg to project background color if it exists
    const currentBackground = backpackRef.value.style.backgroundColor;
    backpackRef.value.style.backgroundColor =
      project?.data.styling.backgroundColor ?? currentBackground;
    // Convert backpack to SVG
    const svgDocument = elementToSVG(backpackRef.value);
    // Inline external resources (fonts, images, etc) as data: URIs
    await inlineResources(svgDocument.documentElement);
    // Restore background color
    backpackRef.value.style.backgroundColor = currentBackground;
    // Get SVG string
    const svgString = new XMLSerializer().serializeToString(svgDocument);
    // Create a Blob from the SVG string
    const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    // Create a downloadable link for img src
    const svgUrl = URL.createObjectURL(svg);
    const img = new Image();
    // set the image src to the URL of the Blob
    img.src = svgUrl;
    // Wait until the image has loaded
    await img.decode();
    // Create a canvas to draw the image to
    const canvas = document.createElement('canvas');
    // Set canvas dimensions to match the image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    // Draw the image to the canvas
    ctx.drawImage(img, 0, 0);
    // Get the image data as a PNG string
    const url = canvas.toDataURL('image/png');
    // Remove the canvas
    canvas.remove();

    isLoading.value = false;
    $toast.dismiss(toastGenerateImage);

    // Ensure the URL is valid before trying to download it
    if (!url.startsWith('data:image/png')) {
      $toast.error('Failed to generate backpack image.');
      console.log(url);
    } else {
      $toast.success('Backpack image generated');
      // Create a element to download the image
      const element = document.createElement('a');
      // Set the download link href and download attribute
      element.href = url;
      element.download = `backpack-${new Date().toLocaleString()}.png`;

      // Click the link to download the image
      await nextTick(() => {
        element.click();
      });
      // Remove the element once downloaded
      element.remove();
    }

    // Clean up the URL after download
    URL.revokeObjectURL(url);
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
      display: flex;
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
.backpackRender .pack-info-container {
  position: unset;
  align-items: center;
  justify-content: center;
}
.backpackRender .pack-scores {
  align-self: center;
  font-size: 1.5rem;
  font-weight: bold;
}
.backpackRender .score-text {
  font-weight: normal;
}

.project-title {
  font-weight: bold;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
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
