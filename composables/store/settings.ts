import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';
import { mergeDeepRight } from 'ramda';

export type DisplaySettings = {
  hideRowImages: boolean;
  hideRowText: boolean;

  hideObjectImages: boolean;
  hideObjectScores: boolean;
  hideObjectRequirements: boolean;
  hideObjectText: boolean;

  hideDisabledAddons: boolean;

  hideAddonRequirements: boolean;
  hideAddonText: boolean;
};

type DisplaySettingsValue =
  | { type: 'custom'; settings: DisplaySettings }
  | { type: 'preset'; name: string };

export const DisplaySettingsPresets: Record<
  string,
  DisplaySettings & { name: string }
> = {
  default: {
    name: 'Default',
    hideRowImages: false,
    hideRowText: false,
    hideObjectImages: false,
    hideObjectScores: false,
    hideObjectRequirements: false,
    hideObjectText: false,
    hideDisabledAddons: false,
    hideAddonRequirements: false,
    hideAddonText: false,
  },
  minimal: {
    name: 'Minimal',
    hideRowImages: true,
    hideRowText: true,
    hideObjectImages: true,
    hideObjectScores: false,
    hideObjectRequirements: false,
    hideObjectText: true,
    hideDisabledAddons: false,
    hideAddonRequirements: false,
    hideAddonText: true,
  },
};

export const useSettingStore = defineStore(
  'viewer-settings',
  () => {
    const showDisabledAddonsInBackpack = ref<boolean>(false);
    const hideImagesInBackpack = ref<boolean>(false);
    const hideTextInBackpack = ref<boolean>(false);
    const lockBackpackObjects = ref<boolean>(true);
    const loadProjectOnStartup = ref<string>('');
    const lightThemeUI = ref<boolean>(false);
    const displaySettings = ref<DisplaySettingsValue>({
      type: 'preset',
      name: 'default',
    });

    const hasPreference = (): boolean => {
      return R.isNotEmpty(loadProjectOnStartup.value);
    };

    const resolveDisplaySettings = (
      overrides?: Partial<DisplaySettings>,
    ): DisplaySettings => {
      const displaySettings0 = displaySettings.value;
      if (displaySettings0.type === 'preset') {
        const preset = DisplaySettingsPresets[displaySettings0.name];
        return mergeDeepRight(preset, overrides ?? {});
      } else {
        return mergeDeepRight(displaySettings0.settings, overrides ?? {});
      }
    };

    return {
      showDisabledAddonsInBackpack,
      hideImagesInBackpack,
      hideTextInBackpack,
      lockBackpackObjects,
      loadProjectOnStartup,
      lightThemeUI,
      displaySettings,
      resolveDisplaySettings,
      hasPreference,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);

export const useSettingRefs = () => storeToRefs(useSettingStore());
