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
              @click="exportToImage()"
            >
              Download Image (Beta)
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="exportToHtml()"
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
import ModalDialog from '~/components/utils/ModalDialog.vue';
import BackpackView from '~/components/viewer/utils/BackpackView.vue';
import ExportCode from '~/components/viewer/utils/ExportCode.vue';
import ImportCode from '~/components/viewer/utils/ImportCode.vue';
import { useSettingRefs, useSettingStore } from '~/composables/store/settings';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';
import { useBackpackRender } from '~/composables/viewer/useBackpackRender';

const { toggleBackpack } = useViewerStore();
const { toggleDisabledAddonsInBackpack, toggleLockBackpackObjects } =
  useSettingStore();
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
