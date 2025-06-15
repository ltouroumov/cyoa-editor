import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';

export const useSettingStore = defineStore(
  'viewer-settings',
  () => {
    const disabledAddons = ref<boolean>(false);
    const disabledAddonsInBackpack = ref<boolean>(true);
    const lockBackpackObjects = ref<boolean>(true);
    const loadProjectOnStartup = ref<string>('');
    const lightThemeUI = ref<boolean>(false);
    const disableImages = ref<boolean>(false);

    const hasPreference = (): boolean => {
      return R.isNotEmpty(loadProjectOnStartup.value);
    };

    const toggleHideDisabledAddons = (set?: boolean) => {
      disabledAddons.value = set ?? !disabledAddons.value;
    };

    const toggleDisabledAddonsInBackpack = (set?: boolean) => {
      disabledAddonsInBackpack.value = set ?? !disabledAddonsInBackpack.value;
    };

    const toggleLockBackpackObjects = (set?: boolean) => {
      lockBackpackObjects.value = set ?? !lockBackpackObjects.value;
    };

    const toggledisplayImages = (set?: boolean) => {
      disableImages.value = set ?? !disableImages.value;
    };

    return {
      disabledAddons,
      disabledAddonsInBackpack,
      lockBackpackObjects,
      loadProjectOnStartup,
      lightThemeUI,
      disableImages,
      hasPreference,
      toggleLockBackpackObjects,
      toggleDisabledAddonsInBackpack,
      toggleHideDisabledAddons,
      toggledisplayImages,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);

export const useSettingRefs = () => storeToRefs(useSettingStore());
