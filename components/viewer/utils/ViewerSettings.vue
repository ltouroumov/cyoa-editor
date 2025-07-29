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
        v-if="isNil(viewerProjectList.default)"
        class="flex flex-col gap-2 py-2"
      >
        <label class="grow" for="hideDisabledAddons"> Default Project </label>
        <Select
          v-model="loadOnStartup"
          aria-label="Default CYOA to load at Startup"
          :options="projectList"
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
    <ul class="flex flex-col gap-0 mb-2">
      <li
        class="flex flex-col gap-2 py-2"
        :class="{
          'border-b border-surface-700': displaySettings.type === 'custom',
        }"
      >
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
      <template v-if="displaySettings.type === 'custom'">
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700 font-bold text-primary"
        >
          Row Settings
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideDisabledAddons"
            input-id="hideDisabledAddons"
            binary
          />
          <div class="flex flex-col gap-1">
            <label class="grow" for="hideDisabledAddons">
              Hide Disabled Addons
            </label>
          </div>
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideRowImages"
            input-id="hideRowImages"
            binary
          />
          <label class="grow" for="hideRowImages"> Hide Row Images </label>
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideRowText"
            input-id="hideRowText"
            binary
          />
          <label class="grow" for="hideRowText"> Hide Row Text </label>
        </li>

        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700 font-bold text-primary"
        >
          Choice Settings
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="isObjectPaginated"
            binary
            input-id="isObjectPaginated"
          />
          <div class="flex flex-col gap-1">
            <label for="isObjectPaginated" class="grow">
              Paginated Object View
            </label>
            <small class="text-slate-500 text-sm">
              Renders choices in a fixed-height container with pagination.
            </small>
          </div>
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideObjectImages"
            input-id="hideObjectImages"
            binary
          />
          <label class="grow" for="hideObjectImages">
            Hide Choice Images
          </label>
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideObjectScores"
            input-id="hideObjectScores"
            binary
          />
          <label class="grow" for="hideObjectScores">
            Hide Choice Scores
          </label>
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideObjectRequirements"
            input-id="hideObjectRequirements"
            binary
          />
          <label class="grow" for="hideObjectRequirements">
            Hide Choice Requirements
          </label>
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideObjectText"
            input-id="hideObjectText"
            binary
          />
          <label class="grow" for="hideObjectText"> Hide Choice Text </label>
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700 font-bold text-primary"
        >
          Addon Settings
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideAddonRequirements"
            input-id="hideAddonRequirements"
            binary
          />
          <label class="grow" for="hideAddonRequirements">
            Hide Addon Requirements
          </label>
        </li>
        <li
          class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
        >
          <Checkbox
            v-model="displaySettings.settings.hideAddonText"
            input-id="hideAddonText"
            binary
          />
          <label class="grow" for="hideAddonText"> Hide Addon Text </label>
        </li>
      </template>
    </ul>
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
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { SelectChangeEvent } from 'primevue';
import { append, isEmpty, isNil, map, prepend } from 'ramda';

import {
  DisplaySettingsPresets,
  useSettingRefs,
} from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';

const { viewerProjectList, isObjectPaginated } = useViewerRefs();
const {
  showDisabledAddonsInBackpack,
  hideImagesInBackpack,
  hideTextInBackpack,
  lockBackpackObjects,
  displaySettings,
  lightThemeUI,
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

const projectList = computed(() => {
  return prepend(
    {
      name: 'None (show menu)',
      value: '--none',
    },
    viewerProjectList.value.items.map((project) => {
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
      settings: DisplaySettingsPresets['default'],
    };
  } else {
    displaySettings.value = {
      type: 'preset',
      name: value,
    };
  }
};
</script>
