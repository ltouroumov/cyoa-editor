import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';
import { isNil, isNotEmpty, mergeDeepRight, symmetricDifference } from 'ramda';

export type DisplaySettings = {
  hideRowImages: boolean;
  hideRowText: boolean;

  hideObjectImages: boolean;
  hideObjectScores: boolean;
  hideObjectRequirements: boolean;
  hideObjectRequirementStatus: boolean;
  hideObjectRequirementMore: boolean;
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
  hideObjectRequirementStatus: false,
  hideObjectRequirementMore: false,
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
    hideObjectRequirementStatus: false,
    hideObjectRequirementMore: false,
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
    const displaySettings = ref<DisplaySettingsValue>({
      type: 'preset',
      name: 'default',
    });

    watch(displaySettings, (newVal, oldValue) => {
      console.log(
        `displaySettings changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(newVal)}`,
      );
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
      afterHydrate: (ctx) => {
        const displaySettings = ctx.store.displaySettings;
        if (displaySettings.type === 'custom') {
          if (
            isNil(displaySettings.settings) ||
            isNotEmpty(
              // Compute the keys that are in only one of the sets
              symmetricDifference(
                Object.keys(displaySettings.settings),
                Object.keys(DefaultSettings),
              ),
            )
          ) {
            console.log(`reset displaySettings to default`);
            ctx.store.displaySettings.settings = DefaultSettings;
          }
        }
      },
    },
  },
);

export const useSettingRefs = () => storeToRefs(useSettingStore());
