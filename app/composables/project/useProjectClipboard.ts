import { isNil } from 'ramda';

import { createId } from '~/composables/project/types/v2/id';
import { useProjectStore } from '~/composables/project/useProjectStore';

export function useProjectClipboard() {
  const $project = useProjectStore();
  const $toast = useToast();

  const copyObject = (objectId: string, from?: string) => {
    const objectData = $project.objects.get(objectId);
    if (isNil(objectData)) return;

    console.log('copyObject', $project.clipboard);
    $project.clipboard.push({
      type: 'object',
      id: createId(),
      data: objectData,
      from: from,
    });
    $toast.add({
      severity: 'success',
      summary: 'Copied to clipboard',
      life: 1000,
    });
  };

  return {
    clipboard: $project.clipboard,
    // Functions
    copyObject,
  };
}
