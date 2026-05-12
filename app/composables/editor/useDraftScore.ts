import type { MaybeRefOrGetter } from 'vue';

import { useDraft } from '~/composables/editor/useDraft';
import type { ProjectScore } from '~/composables/project/types/v2/score';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useDraftScore(
  source: MaybeRefOrGetter<string>,
): Ref<ProjectScore> {
  const $project = useProjectStore();

  return useDraft<ProjectScore>(
    () => $project.scores.get(toValue(source)),
    (value) => {
      $project.scores.set(toValue(source), value);
    },
  );
}
