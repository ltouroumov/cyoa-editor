import type { MaybeRefOrGetter } from 'vue';

import type {
  ObjectMap,
  ObjectType,
} from '~/composables/project/types/v2/objects';
import { useDraft } from '~/composables/editor/useDraft';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useDraftObject<T extends ObjectType>(
  source: MaybeRefOrGetter<string>,
  type: T,
): Ref<ObjectMap[T]> {
  const $project = useProjectStore();

  return useDraft<ObjectMap[T]>(
    () => $project.get(toValue(source), type),
    (value) => {
      $project.objects.value.set(toValue(source), value);
    },
  );
}
