import { clone } from 'ramda';

import { useProjectStore } from '~/composables/project/useProjectStore';
import { type DebouncedFn, debounce } from '~/composables/utils/debounce';

export const DRAFT_FLUSH_DELAY = 300;

export function useDraft<T>(
  getFromStore: () => T | undefined,
  setToStore: (value: T) => void,
): Ref<T> {
  const $project = useProjectStore();

  const draft = ref<T>(clone(getFromStore() as T)) as Ref<T>;
  let isWriting = false;

  const doFlush = (value: T): void => {
    isWriting = true;
    setToStore(value);
    $project.markDirty();
    nextTick(() => {
      isWriting = false;
    });
  };

  const debouncedFlush: DebouncedFn<[T]> = debounce(doFlush, DRAFT_FLUSH_DELAY);

  watch(
    draft,
    (value) => {
      debouncedFlush(value);
    },
    { deep: true },
  );

  watch(getFromStore, (newVal) => {
    if (isWriting) return;
    debouncedFlush.flush();
    if (newVal !== undefined) {
      draft.value = clone(newVal);
    }
  });

  onUnmounted(() => {
    debouncedFlush.flush();
  });

  return draft;
}
