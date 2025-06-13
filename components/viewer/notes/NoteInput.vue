<template>
  <div class="build-note">
    <div class="build-note-header">
      <InputText
        v-if="editable && !staticTitle"
        v-model="note.title"
        type="text"
        class="form-control form-control-sm note-title"
        placeholder="Title ..."
        fluid
      />
      <RemoveNoteButton v-if="editable" @click="removeNote(note.id)" />
      <span v-if="!editable || staticTitle" class="note-title-frozen">
        {{ staticTitle ?? note.title }}
      </span>
    </div>
    <Textarea
      v-if="editable"
      v-model="note.text"
      class="form-control note-text min-h-[8rem]"
      placeholder="Notes go here ..."
      fluid
    ></Textarea>
    <div v-if="!editable" class="note-text">
      {{ note.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBuildNotes } from '~/composables/viewer/useBuildNotes';

const { buildNotes, removeNote } = useBuildNotes();

const $props = defineProps<{
  noteId: string;
  editable: boolean;
  staticTitle?: string;
}>();

const note = computed(() => {
  return buildNotes.value[$props.noteId];
});
</script>

<style scoped lang="scss">
.build-note {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  .build-note-header {
    display: flex;
    flex-direction: row;
    gap: 0.2rem;
    align-items: center;
  }
}
</style>
