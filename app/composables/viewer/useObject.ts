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

  const selectedValue = computed(() => {
    if (obj.value.isSelectableMultiple)
      return selected.value[obj.value.id] ?? minValue.value;
    else return minValue.value;
  });

  const minValue = computed(() =>
    Number.parseInt(obj.value.numMultipleTimesMinus) || 0,
  );
  const maxValue = computed(() =>
    Number.parseInt(obj.value.numMultipleTimesPluss) || 0,
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

  const setValue = (val: number): void => {
    if (canToggle.value) {
      const clampedVal = Math.min(Math.max(val, minValue.value), maxValue.value);
      if (clampedVal <= minValue.value) {
        store.setSelected(obj.value.id, false);
      } else {
        store.setSelected({ [obj.value.id]: clampedVal }, true);
      }
    }
  };

  return {
    isEnabled,
    isSelected,
    canToggle,
    selectedValue,
    minValue,
    maxValue,
    toggle,
    increment,
    decrement,
    setValue,
  };
}
