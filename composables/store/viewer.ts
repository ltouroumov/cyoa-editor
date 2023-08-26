import { defineStore, storeToRefs } from 'pinia';

export const useViewerStore = defineStore('viewer', () => {
  const isBackpackVisible = ref<boolean>(false);

  const toggleBackpack = () => {
    isBackpackVisible.value = !isBackpackVisible.value;
  };

  return { isBackpackVisible, toggleBackpack };
});

export const useViewerRefs = () => storeToRefs(useViewerStore());
