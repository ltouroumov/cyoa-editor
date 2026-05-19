import { clone, isNil } from 'ramda';

import { EntityType } from '~/composables/project/types/v2/base';
import { createId } from '~/composables/project/types/v2/id';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useProjectClipboard() {
  const $project = useProjectStore();
  const $toast = useToast();

  const copyObject = (objectId: string, from?: string) => {
    const objectData = $project.objects.get(objectId);
    if (isNil(objectData)) return;

    $project.clipboard.push({
      type: EntityType.Object,
      id: createId(),
      data: clone(objectData),
      from: from,
    });
    $project.markDirty();
    $toast.add({
      severity: 'success',
      summary: 'Copied to clipboard',
      life: 1000,
    });
  };

  const copyScore = (scoreId: string) => {
    const objectData = $project.scores.get(scoreId);
    if (isNil(objectData)) return;

    $project.clipboard.push({
      type: EntityType.Score,
      id: createId(),
      data: clone(objectData),
    });
    $project.markDirty();
    $toast.add({
      severity: 'success',
      summary: 'Copied to clipboard',
      life: 1000,
    });
  };

  const removeFromClipboard = (id: string) => {
    $project.clipboard = $project.clipboard.filter((item) => item.id !== id);
    $project.markDirty();
  };

  return {
    clipboard: $project.clipboard,
    // Functions
    copyObject,
    copyScore,
    removeFromClipboard,
  };
}
