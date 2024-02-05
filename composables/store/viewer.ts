import { defineStore, storeToRefs } from 'pinia';

export const useViewerStore = defineStore('viewer', () => {
  const isBackpackVisible = ref<boolean>(false);
  const isSearchVisible = ref<boolean>(false);

  const toggleBackpack = (set?: boolean) => {
    isBackpackVisible.value = set ?? !isBackpackVisible.value;
  };

  const toggleSearch = (set?: boolean) => {
    isSearchVisible.value = set ?? !isSearchVisible.value;
  };

  return {
    isBackpackVisible,
    isSearchVisible,
    toggleBackpack,
    toggleSearch,
  };
});

export const useViewerRefs = () => storeToRefs(useViewerStore());
