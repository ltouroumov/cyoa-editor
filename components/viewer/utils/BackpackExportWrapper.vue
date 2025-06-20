<template>
  <div id="backpack" class="project export-container" data-bs-theme="dark">
    <BackpackView
      :vertical-score="false"
      :show-title="true"
      :lock-backpack="true"
      :display="display"
    />

    <div v-if="isNotEmpty(buildNotes)">
      <hr />
      <NotesView :compact="true" :editable="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNotEmpty } from 'ramda';

import BackpackView from '~/components/viewer/utils/BackpackView.vue';
import { useSettingRefs, useSettingStore } from '~/composables/store/settings';
import { useBuildNotes } from '~/composables/viewer/useBuildNotes';

const { buildNotes } = useBuildNotes();
const { resolveDisplaySettings } = useSettingStore();
const { hideTextInBackpack, hideImagesInBackpack } = useSettingRefs();

const display = computed(() => {
  const hideImages = hideImagesInBackpack.value;
  const hideText = hideTextInBackpack.value;
  return resolveDisplaySettings({
    hideObjectImages: hideImages,
    hideObjectText: hideText,
    hideDisabledAddons: true,
    hideAddonText: hideText,
  });
});
</script>

<style scoped lang="scss">
.export-container {
  padding: 1rem;
  max-width: 2000px;
}
</style>
