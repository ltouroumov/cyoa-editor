import { defineStore, storeToRefs } from 'pinia';

export const useSettingStore = defineStore(
  'viewer-settings',
  () => {
    const disabledAddons = ref<boolean>(false);
    const disabledAddonsInBackpack = ref<boolean>(true);
    const lockBackpackObjects = ref<boolean>(true);

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
