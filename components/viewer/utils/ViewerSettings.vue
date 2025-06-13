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
        class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
      >
        <Checkbox
          v-model="disabledAddons"
          input-id="hideDisabledAddons"
          binary
        />
        <div class="flex flex-col gap-1">
          <label class="grow" for="hideDisabledAddons">
            Hide Disabled Addons
          </label>
          <small class="text-slate-500 text-sm">
            When enabled hides addons whose conditions are unmet
          </small>
        </div>
      </li>
      <li
        v-if="isNil(viewerProjectList.default)"
        class="flex flex-row items-center gap-2 py-2"
      >
        <div class="flex flex-col gap-1">
          <label class="grow" for="hideDisabledAddons"> Default Project </label>
          <small class="text-slate-500 text-sm">
            Automatically loads at startup
          </small>
        </div>
        <Select
          v-model="loadOnStartup"
          aria-label="Default CYOA to load at Startup"
          :options="projectList"
          option-label="name"
          option-value="value"
          class="grow"
        />
      </li>
    </ul>
    <h5 class="text-xl text-primary font-bold">Backpack</h5>
    <ul class="flex flex-col gap-0">
      <li
        class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
      >
        <Checkbox
          v-model="disabledAddonsInBackpack"
          input-id="showDisabledAddons"
          binary
        />
        <div class="flex flex-col gap-1">
          <label class="form-check-label" for="showDisabledAddons">
            Show Disabled Addons
          </label>
          <small class="text-slate-500 text-sm">
            Show addons whose conditions are not met in backpack
          </small>
        </div>
      </li>
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
    </ul>
  </div>
</template>

<script setup lang="ts">
import { isEmpty, isNil, prepend } from 'ramda';

import { useSettingRefs } from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';

const { viewerProjectList } = useViewerRefs();
const {
  disabledAddons,
  disabledAddonsInBackpack,
  lockBackpackObjects,
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
</script>
