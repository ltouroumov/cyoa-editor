import { assoc, dissoc, filter, has, startsWith, values, where } from 'ramda';

import { useProjectRefs } from '~/composables/store/project';

export function useBuildNotes() {
  const { buildNotes } = useProjectRefs();

  const hasNote = (noteId: string): boolean => {
    return has(noteId, buildNotes.value);
  };

  const createNote = (noteId: string, randomId?: boolean) => {
    if (randomId) {
      const suffix = crypto.randomUUID();
      noteId = `${noteId}-${suffix}`;
    }

    buildNotes.value = assoc(
      noteId,
      { id: noteId, title: '', text: '' },
      buildNotes.value,
    );
  };

  const removeNote = (noteId: string) => {
    buildNotes.value = dissoc(noteId, buildNotes.value);
  };

  const globalNotes = computed(() => {
    return filter(
      where({ id: startsWith('build-') }),
      values(buildNotes.value),
    );
  });

  return { buildNotes, globalNotes, hasNote, createNote, removeNote };
}
