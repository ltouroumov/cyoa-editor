import { clone } from 'ramda';

import { useProjectStore } from '~/composables/project/useProjectStore';

export const DRAFT_FLUSH_DELAY = 300;

export function useSaveDraft<T>(
  getFromStore: () => T | undefined,
  setToStore: (value: T) => void,
): { draft: Ref<T>; commit(): void; cancel(): void } {
  const $project = useProjectStore();

  const initial = getFromStore();
  if (initial === undefined) {
    throw new Error(
      '[useDraft] getFromStore() returned undefined on init — entity does not exist in the store',
    );
  }

  const draft = ref<T>(clone(initial)) as Ref<T>;

  const commit = () => {
    setToStore(draft.value);
    $project.markDirty();
    draft.value = clone(getFromStore()!);
  };

  const cancel = () => {
    draft.value = clone(getFromStore()!);
  };

  return { draft, commit, cancel };
}
