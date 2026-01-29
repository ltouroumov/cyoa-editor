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
  showObjectControls: 'auto' | 'always' | 'never';
  showObjectOverflow: boolean;
  showObjectAddons: boolean;

  hideDisabledAddons: boolean;

  hideAddonRequirements: boolean;
  hideAddonText: boolean;
};

type DisplaySettingsValue =
  | { type: 'custom'; settings: DisplaySettings }
  | { type: 'preset'; name: string };

const DefaultSettings: DisplaySettings = Object.freeze({
  hideRowImages: false,
  hideRowText: false,
  hideObjectImages: false,
  hideObjectScores: false,
  hideObjectRequirements: false,
  hideObjectText: false,
  showObjectControls: 'auto',
  showObjectOverflow: false,
  showObjectAddons: false,
  hideDisabledAddons: false,
  hideAddonRequirements: false,
  hideAddonText: false,
});

export const DisplaySettingsPresets: Record<
  string,
  DisplaySettings & { name: string }
> = Object.freeze({
  default: Object.freeze({
    name: 'Default',
    ...DefaultSettings,
  }),
  extended: Object.freeze({
    name: 'Extended',
    ...DefaultSettings,
    showObjectControls: 'never',
    showObjectOverflow: true,
    showObjectAddons: true,
  }),
  minimal: Object.freeze({
    name: 'Minimal',
    hideRowImages: true,
    hideRowText: true,
    hideObjectImages: true,
    hideObjectScores: false,
    hideObjectRequirements: false,
    hideObjectText: true,
    showObjectControls: 'always',
    showObjectOverflow: false,
    showObjectAddons: false,
    hideDisabledAddons: false,
    hideAddonRequirements: false,
    hideAddonText: true,
  }),
});

export const useSettingStore = defineStore(
  'viewer-settings',
  () => {
    const showDisabledAddonsInBackpack = ref<boolean>(false);
    const hideImagesInBackpack = ref<boolean>(false);
    const hideTextInBackpack = ref<boolean>(false);
    const lockBackpackObjects = ref<boolean>(true);
    const loadProjectOnStartup = ref<string>('');
    const lightThemeUI = ref<boolean>(false);
    const hideRemoteImages = ref<boolean>(false);
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
      hideRemoteImages,
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
