import type { MaybeRefOrGetter } from 'vue';

import { useDraft } from '~/composables/editor/useDraft';
import type { AnyStyle } from '~/composables/project/types/v2/styles';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useDraftStyle(source: MaybeRefOrGetter<string>): Ref<AnyStyle> {
  const $project = useProjectStore();

  return useDraft<AnyStyle>(
    () => $project.styles.rules[toValue(source)],
    (value) => {
      $project.styles.rules[toValue(source)] = value;
    },
  );
}
