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
        <div class="pack-actions mb-3">
          <div class="pack-actions-download">
            <button
              type="button"
              class="btn btn-primary"
              @click="backpackToImage"
            >
              Download Image (Beta)
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="backpackToHtml"
            >
              Download HTML
            </button>
          </div>
          <div v-show="!isLoading" class="flex-column pack-actions-options">
            <div class="form-check form-switch">
              <input
                id="packRowDisabledSwitch"
                class="form-check-input"
                type="checkbox"
                role="switch"
                :checked="lockBackpackObjects"
                @change="toggleLockBackpackObjects()"
              />
              <label class="form-check-label" for="packRowDisabledSwitch">
                Lock Objects in the Backpack
              </label>
            </div>
            <div class="form-check form-switch">
              <input
                id="hideDisabledAddons"
                class="form-check-input"
                type="checkbox"
                role="switch"
                :checked="disabledAddonsInBackpack"
                @change="toggleDisabledAddonsInBackpack()"
              />
              <label class="form-check-label" for="hideDisabledAddons">
                Show Disabled Addons
              </label>
            </div>
          </div>
        </div>
        <BackpackView
          ref="backpackRef"
          :vertical-score="!isLoading"
          :show-title="isLoading"
        />
        <div class="pack-import-export">
          <ImportCode />
          <ExportCode />
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import canvasSize from 'canvas-size';
import { elementToSVG, inlineResources } from 'dom-to-svg';
import { h, render } from 'vue';
import { useToast } from 'vue-toastification';

import ModalDialog from '~/components/utils/ModalDialog.vue';
import BackpackExportWrapper from '~/components/viewer/utils/BackpackExportWrapper.vue';
import BackpackView from '~/components/viewer/utils/BackpackView.vue';
import ExportCode from '~/components/viewer/utils/ExportCode.vue';
import ImportCode from '~/components/viewer/utils/ImportCode.vue';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useSettingRefs, useSettingStore } from '~/composables/store/settings';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { project } = useProjectStore();
const { selected } = useProjectRefs();
const { toggleBackpack } = useViewerStore();
const { toggleDisabledAddonsInBackpack, toggleLockBackpackObjects } =
  useSettingStore();
const { isBackpackVisible } = useViewerRefs();
const { disabledAddonsInBackpack, lockBackpackObjects } = useSettingRefs();

const maxCanvasSize = async (size: number) => {
  const { width, height } = await canvasSize.maxArea({
    max: size,
    usePromise: true,
  });
  return { width, height };
};

const backpackRef = ref<InstanceType<typeof BackpackView>>();
const isLoading = ref(false);
const backpackToImage = async () => {
  // if (packRows.value.length <= 0) {
  //   alert(
  //     'No objects selected to create a backpack image, select at least one object to create a image.',
  //   );
  //   return;
  // }
  const backpackNode = backpackRef.value?.$el;
  if (!backpackNode) return;

  isLoading.value = true;
  const $toast = useToast();
  const toastGenerateImage = $toast.info('Generating image...', {
    timeout: false,
  });
  // Wait for the next tick to ensure DOM is updated before getting the element.
  await nextTick();

  // Set background color for svg to project background color if it exists
  const currentBackground = backpackNode.style.backgroundColor;
  backpackNode.style.backgroundColor =
    project?.data.styling.backgroundColor ?? currentBackground;
  // Convert backpack to SVG
  const svgDocument = elementToSVG(backpackNode);
  // Inline external resources (fonts, images, etc) as data: URIs
  await inlineResources(svgDocument.documentElement);
  // Restore background color
  backpackNode.style.backgroundColor = currentBackground;
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
  // Ensure the image size is not too large for the canvas
  const { width, height } = await maxCanvasSize(
    Math.max(img.naturalWidth, img.naturalHeight),
  );
  // Set canvas dimensions to match the image
  canvas.width = Math.min(width, img.naturalWidth);
  canvas.height = Math.min(height, img.naturalHeight);
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
};

const copyStyles = (sourceDoc: Document, targetDoc: Document): void => {
  for (const styleSheet of Array.from(sourceDoc.styleSheets)) {
    if (styleSheet.cssRules) {
      // for <style> elements
      const nwStyleElement = sourceDoc.createElement('style');

      for (const cssRule of Array.from(styleSheet.cssRules)) {
        // write the text of each rule into the body of the style element
        nwStyleElement.append(sourceDoc.createTextNode(cssRule.cssText));
      }

      targetDoc.head.append(nwStyleElement);
    } else if (styleSheet.href) {
      // for <link> elements loading CSS from a URL
      const nwLinkElement = sourceDoc.createElement('link');

      nwLinkElement.rel = 'stylesheet';
      nwLinkElement.href = styleSheet.href;
      targetDoc.head.append(nwLinkElement);
    }
  }
};

const backpackToHtml = async () => {
  const wRef = window.open('', '_blank');
  if (!wRef) return;

  const wDoc = wRef.window.document;
  copyStyles(window.document, wDoc);
  wDoc.body.setAttribute('data-bs-theme', 'dark');

  const vNode = h(BackpackExportWrapper, {});
  render(vNode, wDoc.body);
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
}

.backpackRender {
  width: 2000px !important;
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

.pack-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .pack-actions-download {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: start;
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
