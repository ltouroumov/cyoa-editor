import { defineStore, storeToRefs } from 'pinia';

import type { ViewerProjectList } from '~/composables/viewer';
import PROJECTS from '~/config/viewer/projects.json';

export const useViewerStore = defineStore('viewer', () => {
  const isBackpackVisible = ref<boolean>(false);
  const isNotesVisible = ref<boolean>(false);
  const isSearchVisible = ref<boolean>(false);
  const isProjectMenuVisible = ref<boolean>(false);

  const viewerProjectList = ref<ViewerProjectList>(PROJECTS);

  const toggleBackpack = (set?: boolean) => {
    isBackpackVisible.value = set ?? !isBackpackVisible.value;
  };

  const toggleNotes = (set?: boolean) => {
    isNotesVisible.value = set ?? !isNotesVisible.value;
  };

  const toggleSearch = (set?: boolean) => {
    isSearchVisible.value = set ?? !isSearchVisible.value;
  };

  const toggleProjectMenu = (set?: boolean) => {
    isProjectMenuVisible.value = set ?? !isProjectMenuVisible.value;
  };

  return {
    isBackpackVisible,
    isNotesVisible,
    isSearchVisible,
    isProjectMenuVisible,
    viewerProjectList,
    toggleBackpack,
    toggleNotes,
    toggleSearch,
    toggleProjectMenu,
  };
});

export const useViewerRefs = () => storeToRefs(useViewerStore());
