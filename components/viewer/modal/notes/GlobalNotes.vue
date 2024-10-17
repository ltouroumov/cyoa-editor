<template>
  <div class="notes-build">
    <div class="notes-build-header">
      <div class="notes-build-title">Project Notes</div>
      <AddNoteButton v-if="editable" @click="createNote(`build`, true)" />
    </div>
    <div class="notes-build-list">
      <NoteInput
        v-for="note in globalNotes"
        :key="note.id"
        :note-id="note.id"
        :editable="editable"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AddNoteButton from '~/components/viewer/modal/notes/AddNoteButton.vue';
import { useBuildNotes } from '~/composables/viewer/useBuildNotes';

const { globalNotes, createNote, removeNote } = useBuildNotes();

defineProps<{
  editable: boolean;
}>();
</script>

<style scoped lang="scss">
.notes-build {
  grid-column: 1/3;

  .notes-build-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .notes-build-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .notes-build-title {
    font-weight: bold;
    font-size: 1.1rem;
  }
}
</style>
