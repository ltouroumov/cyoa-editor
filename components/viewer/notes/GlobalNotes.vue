<template>
  <div v-if="compact ? hasNotes : true" class="notes-build">
    <div class="notes-build-header">
      <div class="notes-build-title">Index Notes</div>
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
import { isNotEmpty } from 'ramda';

import AddNoteButton from '~/components/viewer/notes/AddNoteButton.vue';
import { useBuildNotes } from '~/composables/viewer/useBuildNotes';

const { globalNotes, createNote } = useBuildNotes();

defineProps<{
  editable: boolean;
  compact: boolean;
}>();

const hasNotes = computed(() => {
  return isNotEmpty(globalNotes.value);
});
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
