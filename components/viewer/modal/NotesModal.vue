<template>
  <ModalDialog
    :show="isNotesVisible"
    size="modal-80"
    @close="toggleNotes(false)"
  >
    <template #header>
      <h5 class="m-0">Notes</h5>
    </template>
    <template #default>
      <NotesView :compact="false" :editable="true" />
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from '~/components/utils/ModalDialog.vue';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { toggleNotes } = useViewerStore();
const { isNotesVisible } = useViewerRefs();
</script>

<style scoped lang="scss"></style>
