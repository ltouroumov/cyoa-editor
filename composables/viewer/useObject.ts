import * as R from 'ramda';
import type { ComputedRef } from 'vue';

import { buildConditions } from '~/composables/conditions';
import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
export function useObject({
  obj,
  row,
  ...options
}: {
  obj: ComputedRef<ProjectObj>;
  row?: ComputedRef<ProjectRow>;
  canToggle?: ComputedRef<boolean>;
}) {
  const store = useProjectStore();
  const { selectedIds, selected } = useProjectRefs();

  const condition = computed(() => buildConditions(obj.value));
  const isEnabled = computed<boolean>(() => {
    return condition.value(selectedIds.value);
  });
  const isSelected = computed<boolean>(() => {
    return R.has(obj.value.id, selected.value);
  });
  const canToggle = computed<boolean>(() => {
    return (
      isEnabled.value &&
      !obj.value.isNotSelectable &&
      !row?.value.isInfoRow &&
      (options.canToggle?.value ?? true)
    );
  });

  const selectedAmount = computed(() => {
    if (obj.value.isSelectableMultiple)
      return selected.value[obj.value.id] ?? 0;
    else return 0;
  });

  const minSelectedAmount = computed(() =>
    Number.parseInt(obj.value.numMultipleTimesMinus),
  );
  const maxSelectedAmount = computed(() =>
    Number.parseInt(obj.value.numMultipleTimesPluss),
  );

  const toggle = () => {
    if (canToggle.value && !obj.value.isSelectableMultiple) {
      store.setSelected(obj.value.id, !isSelected.value);
    }
  };

  const increment = () => {
    if (canToggle.value) {
      store.incSelected(obj.value.id);
    }
  };
  const decrement = () => {
    if (canToggle.value) {
      store.decSelected(obj.value.id);
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
