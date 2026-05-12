import type { MaybeRefOrGetter } from 'vue';

import type { ProjectImage } from '~/composables/project/types/v2/media';
import { useDraft } from '~/composables/editor/useDraft';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useDraftImage(
  source: MaybeRefOrGetter<string>,
): Ref<ProjectImage> {
  const $project = useProjectStore();

  return useDraft<ProjectImage>(
    () => $project.media.value.images[toValue(source)],
    (value) => {
      $project.media.value.images[toValue(source)] = value;
    },
  );
}
