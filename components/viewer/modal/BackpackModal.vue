<template>
  <Dialog
    v-model:visible="isBackpackVisible"
    modal
    dismissable-mask
    class="w-full h-full lg:mx-[2rem] mx-0"
    :dt="{ header: { padding: '1rem' }, content: { padding: '1rem' } }"
  >
    <template #header>
      <h5 class="text-primary text-xl">Choices</h5>
    </template>
    <div class="pack-content flex-grow-1 bg-dark">
      <div class="pack-actions mb-3">
        <div class="pack-actions-download">
          <Button @click="exportToImage()"> Download Image (Beta)</Button>
          <Button @click="exportToHtml()"> Download HTML</Button>
        </div>
        <div v-show="!isLoading" class="flex flex-col gap-1">
          <Button
            icon="pi pi-cog"
            severity="secondary"
            label="Settings"
            @click="toggleSettings"
          />
          <Popover ref="settingsPopover">
            <div class="flex flex-col gap-2">
              <div class="flex flex-row items-center gap-1">
                <ToggleSwitch
                  v-model="lockBackpackObjects"
                  input-id="packRowDisabledSwitch"
                />
                <label class="form-check-label" for="packRowDisabledSwitch">
                  Lock Objects in the Backpack
                </label>
              </div>
              <div class="flex flex-row items-center gap-1">
                <ToggleSwitch
                  v-model="showDisabledAddonsInBackpack"
                  input-id="showDisabledAddonsInBackpack"
                />
                <label
                  class="form-check-label"
                  for="showDisabledAddonsInBackpack"
                >
                  Show Disabled Addons in the Backpack
                </label>
              </div>
              <div class="flex flex-row items-center gap-1">
                <ToggleSwitch
                  v-model="hideImagesInBackpack"
                  input-id="hideImagesInBackpack"
                />
                <label class="form-check-label" for="hideImagesInBackpack">
                  Hide Images in the Backpack
                </label>
              </div>
              <div class="flex flex-row items-center gap-1">
                <ToggleSwitch
                  v-model="hideTextInBackpack"
                  input-id="hideTextInBackpack"
                />
                <label class="form-check-label" for="hideTextInBackpack">
                  Hide Text in the Backpack
                </label>
              </div>
            </div>
          </Popover>
        </div>
      </div>
      <BackpackView
        ref="backpackRef"
        :vertical-score="!isLoading"
        :show-title="isLoading"
        :display="display"
        :lock-backpack="lockBackpackObjects"
      />
      <div class="flex lg:flex-row flex-col gap-2 justify-stretch">
        <div class="flex flex-col gap-2 grow basis-0">
          <ImportCode class="grow basis-0" />
          <div class="my-1 border-t border-surface-700"></div>
          <ExportCode class="grow basis-0" />
        </div>
        <div class="lg:mx-1 lg:border-l my-1 border-t border-surface-700"></div>
        <ExportText class="grow basis-0" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import BackpackView from '~/components/viewer/utils/BackpackView.vue';
import ExportCode from '~/components/viewer/utils/ExportCode.vue';
import ImportCode from '~/components/viewer/utils/ImportCode.vue';
import { useSettingRefs, useSettingStore } from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';
import { useBackpackRender } from '~/composables/viewer/useBackpackRender';

const { resolveDisplaySettings } = useSettingStore();
const { isBackpackVisible } = useViewerRefs();
const {
  showDisabledAddonsInBackpack,
  hideImagesInBackpack,
  hideTextInBackpack,
  lockBackpackObjects,
} = useSettingRefs();
const { exportToImage, exportToHtml } = useBackpackRender();

const backpackRef = ref<InstanceType<typeof BackpackView>>();
const settingsPopover = ref();
const isLoading = ref(false);

const toggleSettings = (event: any) => {
  settingsPopover.value.toggle(event);
};

const display = computed(() => {
  const hideImages = hideImagesInBackpack.value;
  const hideText = hideTextInBackpack.value;
  return resolveDisplaySettings({
    hideObjectImages: hideImages,
    hideObjectText: hideText,
    hideDisabledAddons: !showDisabledAddonsInBackpack.value,
    hideAddonText: hideText,
  });
});
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
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }

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
