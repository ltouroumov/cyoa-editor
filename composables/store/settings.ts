import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';

export const useSettingStore = defineStore(
  'viewer-settings',
  () => {
    const disabledAddons = ref<boolean>(false);
    const disabledAddonsInBackpack = ref<boolean>(true);
    const lockBackpackObjects = ref<boolean>(true);
    const cyoaPreference = ref<string>('');
    const lightThemeUI = ref<boolean>(false);

    const hasPreference = (): boolean => {
      return R.isNotEmpty(cyoaPreference.value);
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

    return {
      disabledAddons,
      disabledAddonsInBackpack,
      lockBackpackObjects,
      cyoaPreference,
      lightThemeUI,
      hasPreference,
      toggleLockBackpackObjects,
      toggleDisabledAddonsInBackpack,
      toggleHideDisabledAddons,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);

export const useSettingRefs = () => storeToRefs(useSettingStore());
