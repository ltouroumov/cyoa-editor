import { defineStore, storeToRefs } from 'pinia';

import type { ViewerProjectList } from '~/composables/viewer';

export const useViewerStore = defineStore('viewer', () => {
  const isBackpackVisible = ref<boolean>(false);
  const isSearchVisible = ref<boolean>(false);
  const isProjectMenuVisible = ref<boolean>(false);

  const viewerProjectList = ref<ViewerProjectList>({
    items: [
      {
        remoteFileUrl:
          'https://raw.githubusercontent.com/ltouroumov/worm-cyoa-v6-fork/master/extract-v6.0.json',
        title: "Worm V6.0 (Pixel's Version)",
      },
      {
        remoteFileUrl:
          'https://raw.githubusercontent.com/ltouroumov/worm-cyoa-v6-fork/master/extract-v6.1.json',
        title: "Worm V6.1 (Pixel's Version)",
      },
      {
        remoteFileUrl:
          'https://raw.githubusercontent.com/ltouroumov/worm-cyoa-v6-fork/master/project-v17.json',
        title: "Worm V6 (Lt's Fork)",
      },
      {
        remoteFileUrl:
          'https://raw.githubusercontent.com/ltouroumov/pathfinder-cyoa/main/project-v0.json',
        title: 'Pathfinder CYOA (WIP by Lt Ouroumov)',
      },
      // Add more projects...
    ],
  });

  const toggleBackpack = (set?: boolean) => {
    isBackpackVisible.value = set ?? !isBackpackVisible.value;
  };

  const toggleSearch = (set?: boolean) => {
    isSearchVisible.value = set ?? !isSearchVisible.value;
  };

  const toggleProjectMenu = (set?: boolean) => {
    isProjectMenuVisible.value = set ?? !isProjectMenuVisible.value;
  };

  return {
    isBackpackVisible,
    isSearchVisible,
    isProjectMenuVisible,
    viewerProjectList,
    toggleBackpack,
    toggleSearch,
    toggleProjectMenu,
  };
});

export const useViewerRefs = () => storeToRefs(useViewerStore());
