<template>
  <div v-if="compact ? hasNote : true" class="row-note">
    <div class="row-note-header">
      <span class="note-label">Section Notes</span>
      <AddNoteButton v-if="!hasNote && editable" @click="createNote(noteId)" />
      <RemoveNoteButton
        v-if="hasNote && editable"
        @click="removeNote(noteId)"
      />
    </div>
    <textarea
      v-if="hasNote && editable"
      v-model="buildNotes[noteId].text"
      class="form-control note-text"
    ></textarea>
    <div v-if="hasNote && !editable" class="note-text">
      {{ buildNotes[noteId].text }}
    </div>
  </div>
</template>
<script setup lang="ts">
import type { ProjectRow } from '~/composables/project/types/v1';
import { useBuildNotes } from '~/composables/viewer/useBuildNotes';

const {
  buildNotes,
  hasNote: _hasNote,
  createNote,
  removeNote,
} = useBuildNotes();

const $props = defineProps<{
  packRow: ProjectRow;
  editable: boolean;
  compact: boolean;
}>();

const noteId = computed(() => {
  return `row:${$props.packRow.id}`;
});
const hasNote = computed(() => {
  return _hasNote(noteId.value);
});
</script>

<style scoped lang="scss">
.row-note {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.row-note-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.note-label {
  font-style: italic;
}
</style>
