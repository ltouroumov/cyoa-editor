<template>
  <Dialog
    v-model:visible="isNotesVisible"
    modal
    dismissable-mask
    class="w-full h-full mx-[2rem]"
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
