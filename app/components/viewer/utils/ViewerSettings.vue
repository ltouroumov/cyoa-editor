<template>
  <div>
    <h5 class="text-xl text-primary font-bold">Viewer</h5>
    <ul class="flex flex-col gap-0 mb-2">
      <li
        class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
      >
        <Checkbox v-model="lightThemeUI" binary input-id="lightThemeUI" />
        <div class="flex flex-col gap-1">
          <label for="lightThemeUI" class="grow"> Light Theme UI </label>
          <small class="text-slate-500 text-sm">
            When enabled, the viewer UI will use the light theme.
          </small>
        </div>
      </li>
      <li
        v-if="isNil(librarySettings.default)"
        class="flex flex-col gap-2 py-2"
      >
        <label class="grow" for="hideDisabledAddons"> Default Project </label>
        <Select
          v-model="loadOnStartup"
          aria-label="Default CYOA to load at Startup"
          :options="projectListItems"
          option-label="name"
          option-value="value"
          class="grow"
        />
        <small class="text-slate-500 text-sm">
          Automatically loads at startup
        </small>
      </li>
    </ul>
    <h5 class="text-xl text-primary font-bold">Display</h5>
    <div class="mb-2">
      <ul class="flex flex-col gap-0">
        <li class="flex flex-col gap-2 py-2">
          <label class="grow">Preset</label>
          <Select
            aria-label="Default CYOA to load at Startup"
            :model-value="displayPresetValue"
            :options="displayPresets"
            option-label="name"
            option-value="value"
            class="grow"
            @change="loadDisplayPreset"
          />
        </li>
      </ul>
      <DisplaySettings />
    </div>
    <h5 class="text-xl text-primary font-bold">Backpack</h5>
    <ul class="flex flex-col gap-0">
      <li class="flex flex-row items-center gap-2 py-2">
        <Checkbox
          v-model="lockBackpackObjects"
          input-id="lockBackpackObjects"
          binary
        />
        <div class="flex flex-col gap-1">
          <label class="form-check-label" for="lockBackpackObjects">
            Lock objects in backpack
          </label>
          <small class="text-slate-500 text-sm">
            Does not deselect backpack items when clicked
          </small>
        </div>
      </li>
      <li
        class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
      >
        <Checkbox
          v-model="showDisabledAddonsInBackpack"
          input-id="showDisabledAddonsInBackpack"
          binary
        />
        <div class="flex flex-col gap-1">
          <label class="form-check-label" for="showDisabledAddonsInBackpack">
            Show Disabled Addons
          </label>
          <small class="text-slate-500 text-sm">
            Show addons whose conditions are not met in backpack
          </small>
        </div>
      </li>
      <li
        class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
      >
        <Checkbox
          v-model="hideImagesInBackpack"
          input-id="hideImagesInBackpack"
          binary
        />
        <div class="flex flex-col gap-1">
          <label class="form-check-label" for="hideImagesInBackpack">
            Hide Images
          </label>
          <small class="text-slate-500 text-sm">
            Hide images in the backpack and export
          </small>
        </div>
      </li>
      <li
        class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
      >
        <Checkbox
          v-model="hideTextInBackpack"
          input-id="hideTextInBackpack"
          binary
        />
        <div class="flex flex-col gap-1">
          <label class="form-check-label" for="hideTextInBackpack">
            Hide Choice Text
          </label>
          <small class="text-slate-500 text-sm">
            Hide choice text in the backpack and export
          </small>
        </div>
      </li>
      <li
        class="flex flex-row items-center gap-2 py-2 border-b border-surface-700 font-bold text-primary"
      >
        Cache Settings
      </li>
      <li
        class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
      >
        <Checkbox
          v-model="hideUncachedImages"
          input-id="hideUncachedImages"
          binary
        />
        <div class="flex flex-col gap-1">
          <label class="form-check-label" for="hideUncachedImages">
            Hide Uncached Images
          </label>
          <small class="text-slate-500 text-sm">
            Only show images that have been cached
          </small>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { SelectChangeEvent } from 'primevue';
import { append, clone, isEmpty, isNil, map, prepend } from 'ramda';

import {
  DisplaySettingsPresets,
  useSettingRefs,
} from '~/composables/store/settings';
import { useViewerLibrary } from '~/composables/viewer/useViewerLibrary';

const { projectList, librarySettings } = useViewerLibrary();
const {
  showDisabledAddonsInBackpack,
  hideImagesInBackpack,
  hideTextInBackpack,
  lockBackpackObjects,
  displaySettings,
  lightThemeUI,
  hideUncachedImages,
  loadProjectOnStartup,
} = useSettingRefs();

const loadOnStartup = computed({
  get: () => {
    if (isEmpty(loadProjectOnStartup.value)) return '--none';
    else return loadProjectOnStartup.value;
  },
  set: (value: string) => {
    if (value === '--none') {
      loadProjectOnStartup.value = '';
    } else {
      loadProjectOnStartup.value = value;
    }
  },
});

const projectListItems = computed(() => {
  return prepend(
    {
      name: 'None (show menu)',
      value: '--none',
    },
    projectList.value.map((project) => {
      return { name: project.title, value: project.id };
    }),
  );
});

const displayPresetValue = computed(() => {
  const displaySettings0 = displaySettings.value;
  if (displaySettings0.type === 'preset') return displaySettings0.name;
  else return '--custom';
});
const displayPresets: { value: string; name: string }[] = append(
  { value: '--custom', name: 'Custom' },
  map(
    ([value, { name }]) => ({ value, name }),
    Object.entries(DisplaySettingsPresets),
  ),
);

const loadDisplayPreset = (event: SelectChangeEvent) => {
  const value = event.value;
  if (value === '--custom') {
    displaySettings.value = {
      type: 'custom',
      settings: clone(DisplaySettingsPresets['default']),
    };
  } else {
    displaySettings.value = {
      type: 'preset',
      name: value,
    };
  }
};
</script>
