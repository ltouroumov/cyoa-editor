import { defineStore, storeToRefs } from 'pinia';

import type { ViewerProjectList } from '~/composables/viewer';

type ShowDetails =
  | {
      id: string;
      tab: 'details';
    }
  | {
      id: string;
      addonId?: string | number;
      tab: 'parents';
    };
export const useViewerStore = defineStore('viewer', () => {
  const isBackpackVisible = ref<boolean>(false);
  const isNotesVisible = ref<boolean>(false);
  const isSearchVisible = ref<boolean>(false);
  const isProjectMenuVisible = ref<boolean>(false);
  const showObjectDetails = ref<ShowDetails | false>(false);

  const viewerProjectList = ref<ViewerProjectList>({
    items: [],
    default: null,
    show_load_file: true,
    show_project_sidebar: true,
  });

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
    showObjectDetails,
    toggleBackpack,
    toggleNotes,
    toggleSearch,
    toggleProjectMenu,
  };
});

export const useViewerRefs = () => storeToRefs(useViewerStore());
