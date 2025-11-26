<template>
  <Dialog
    v-model:visible="isNotesVisible"
    :modal="true"
    :dismissable-mask="true"
    :draggable="false"
    :maximizable="false"
    class="w-full h-full lg:mx-[2rem] mx-0"
    :dt="{ header: { padding: '1rem' }, content: { padding: '1rem' } }"
  >
    <template #header>
      <h5 class="text-primary text-xl">Notes</h5>
    </template>
    <template #default>
      <NotesView :compact="false" :editable="true" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { toggleNotes } = useViewerStore();
const { isNotesVisible } = useViewerRefs();
</script>

<style scoped lang="scss"></style>
