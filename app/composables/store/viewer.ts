import { defineStore, storeToRefs } from 'pinia';

import type {
  LibrarySettings,
  ViewerProject,
} from '~/composables/viewer/types';

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

  const librarySettings = ref<LibrarySettings>({
    default: null,
    show_load_file: true,
    show_project_sidebar: true,
  });

  const remoteProjectList = ref<ViewerProject[]>([]);

  return {
    isBackpackVisible,
    isNotesVisible,
    isSearchVisible,
    isProjectMenuVisible,
    showObjectDetails,
    toggleBackpack,
    toggleNotes,
    toggleSearch,
    toggleProjectMenu,

    librarySettings,
    remoteProjectList,
  };
});

export const useViewerRefs = () => storeToRefs(useViewerStore());
