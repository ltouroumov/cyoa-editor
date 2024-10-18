<template>
  <div class="notes-object">
    <div class="notes-object-header">
      <div>{{ obj.title }}</div>
      <AddNoteButton v-if="!hasNote && editable" @click="createNote(noteId)" />
      <RemoveNoteButton
        v-if="hasNote && editable"
        @click="removeNote(noteId)"
      />
    </div>
    <div v-if="hasNote" class="obj-note">
      <textarea
        v-if="editable"
        v-model="buildNotes[noteId].text"
        class="form-control note-text"
        placeholder="Notes go here ..."
      ></textarea>
      <div v-if="!editable" class="note-text">
        {{ buildNotes[noteId].text }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useBuildNotes } from '~/composables/viewer/useBuildNotes';

const {
  buildNotes,
  hasNote: _hasNote,
  createNote,
  removeNote,
} = useBuildNotes();

const $props = defineProps<{
  obj: ProjectObj;
  editable: boolean;
}>();

const noteId = computed(() => {
  return `obj:${$props.obj.id}`;
});
const hasNote = computed(() => {
  return _hasNote(noteId.value);
});
</script>

<style scoped lang="scss">
.notes-object {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.notes-object-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  gap: 0.5rem;
}
</style>
