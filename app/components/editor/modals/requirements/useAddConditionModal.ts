import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import { isNotNil } from 'ramda';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';

export function useAddConditionModal() {
  const $dialog = useDialog();
  const LazyAddConditionModal = defineAsyncComponent(
    () =>
      import('~/components/editor/modals/requirements/AddConditionModal.vue'),
  );

  const showAddConditionModal = (onResult: (term: ConditionTerm) => void) => {
    $dialog.open(LazyAddConditionModal, {
      data: {},
      onClose: (
        options:
          | DynamicDialogCloseOptions<{ result: ConditionTerm }>
          | undefined,
      ) => {
        console.log('Add condition modal closed', options);
        const result = options?.data?.result;
        if (isNotNil(result)) {
          onResult(result);
        }
      },
      props: {
        header: `Add Requirement`,
        modal: true,
        draggable: false,
        position: 'top',
      },
    });
  };

  return { showAddConditionModal };
}
