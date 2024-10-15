<template>
  <div class="export-container" data-bs-theme="dark">
    <BackpackView
      :vertical-score="false"
      :show-title="true"
      :lock-backpack="true"
      :hide-disabled-addons="true"
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
import { useBuildNotes } from '~/composables/viewer/useBuildNotes';

const { buildNotes } = useBuildNotes();
</script>

<style scoped lang="scss">
.export-container {
  padding: 1rem;
}
</style>
