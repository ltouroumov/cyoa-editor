<template>
  <Dialog
    v-model:visible="isBackpackVisible"
    modal
    dismissable-mask
    class="w-full h-full mx-[2rem]"
    :dt="{ header: { padding: '1rem' }, content: { padding: '1rem' } }"
  >
    <template #header>
      <h5 class="text-primary text-xl">Choices</h5>
    </template>
    <div class="pack-content flex-grow-1 bg-dark">
      <div class="pack-actions mb-3">
        <div class="pack-actions-download">
          <Button @click="exportToImage()"> Download Image (Beta) </Button>
          <Button @click="exportToHtml()"> Download HTML </Button>
        </div>
        <div
          v-show="!isLoading"
          class="flex flex-col gap-1 pack-actions-options"
        >
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
              v-model="disabledAddonsInBackpack"
              input-id="hideDisabledAddons"
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
      <div class="flex flex-row gap-2 justify-stretch">
        <div class="flex flex-col gap-2 grow basis-0">
          <ImportCode class="grow basis-0" />
          <div class="my-1 border-t border-surface-700"></div>
          <ExportCode class="grow basis-0" />
        </div>
        <div class="mx-1 border-l border-surface-700"></div>
        <ExportText class="grow basis-0" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import BackpackView from '~/components/viewer/utils/BackpackView.vue';
import ExportCode from '~/components/viewer/utils/ExportCode.vue';
import ImportCode from '~/components/viewer/utils/ImportCode.vue';
import { useSettingRefs } from '~/composables/store/settings';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';
import { useBackpackRender } from '~/composables/viewer/useBackpackRender';

const { toggleBackpack } = useViewerStore();
const { isBackpackVisible } = useViewerRefs();
const { disabledAddonsInBackpack, lockBackpackObjects } = useSettingRefs();
const { exportToImage, exportToHtml } = useBackpackRender();

const backpackRef = ref<InstanceType<typeof BackpackView>>();
const isLoading = ref(false);
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
