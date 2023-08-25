import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';

export const useViewerStore = defineStore('viewer', () => {
  const selected = ref<string[]>([]);

  const setSelected = (id: string, isSelected: boolean) => {
    console.log(`setSelected(${id}, ${isSelected})`);
    if (isSelected) {
      selected.value = R.append(id, selected.value);
    } else {
      selected.value = R.without([id], selected.value);
    }
  };

  return { selected, setSelected };
});

export const useViewerRefs = () => storeToRefs(useViewerStore());
