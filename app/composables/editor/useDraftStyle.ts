import type { MaybeRefOrGetter } from 'vue';

import type { AnyStyle } from '~/composables/project/types/v2/styles';
import { useDraft } from '~/composables/editor/useDraft';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useDraftStyle(source: MaybeRefOrGetter<string>): Ref<AnyStyle> {
  const $project = useProjectStore();

  return useDraft<AnyStyle>(
    () => $project.styles.value.rules[toValue(source)],
    (value) => {
      $project.styles.value.rules[toValue(source)] = value;
    },
  );
}
