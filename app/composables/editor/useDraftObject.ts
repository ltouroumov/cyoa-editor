import type { MaybeRefOrGetter } from 'vue';

import { useDraft } from '~/composables/editor/useDraft';
import type { ObjectMap } from '~/composables/project/types/v2/objects';
import type { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useDraftObject<T extends ObjectType>(
  source: MaybeRefOrGetter<string>,
  type: T,
): Ref<ObjectMap[T]> {
  const $project = useProjectStore();

  return useDraft<ObjectMap[T]>(
    () => $project.get(toValue(source), type),
    (value) => {
      $project.objects.set(toValue(source), value);
    },
  );
}
