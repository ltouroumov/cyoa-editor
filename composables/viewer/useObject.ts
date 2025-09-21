import * as R from 'ramda';

import { buildConditions } from '~/composables/conditions';
import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

export function useObject(obj: ProjectObj, row?: ProjectRow) {
  const store = useProjectStore();
  const { selectedIds, selected } = useProjectRefs();

  const condition = computed(() => buildConditions(obj));
  const isEnabled = computed<boolean>(() => {
    return condition.value(selectedIds.value);
  });
  const isSelected = computed<boolean>(() => {
    return R.has(obj.id, selected.value);
  });
  const canToggle = computed<boolean>(() => {
    return isEnabled.value && !obj.isNotSelectable && !row?.isInfoRow;
  });

  const selectedAmount = computed(() => {
    if (obj.isSelectableMultiple) return selected.value[obj.id] ?? 0;
    else return 0;
  });

  const minSelectedAmount = computed(() =>
    Number.parseInt(obj.numMultipleTimesMinus),
  );
  const maxSelectedAmount = computed(() =>
    Number.parseInt(obj.numMultipleTimesPluss),
  );

  const toggle = () => {
    if (canToggle.value && !obj.isSelectableMultiple) {
      store.setSelected(obj.id, !isSelected.value);
    }
  };

  const increment = () => {
    if (canToggle.value) {
      store.incSelected(obj.id);
    }
  };
  const decrement = () => {
    if (canToggle.value) {
      store.decSelected(obj.id);
    }
  };

  return {
    isEnabled,
    isSelected,
    canToggle,
    selectedAmount,
    minSelectedAmount,
    maxSelectedAmount,
    toggle,
    increment,
    decrement,
  };
}
