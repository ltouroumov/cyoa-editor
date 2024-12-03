<template>
  <div>
    <h5 class="text-center">Viewer</h5>
    <ul class="list-group list-group-flush">
      <li class="list-group-item flex items-center">
        <div class="form-check form-switch">
          <input
            id="lightThemeUI"
            v-model="lightThemeUI"
            class="form-check-input me-1"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="lightThemeUI">
            Light Theme UI
            <small class="text-body-secondary ms-3">
              When enabled, the viewer UI will use the light theme.
            </small>
          </label>
        </div>
      </li>
      <li class="list-group-item flex items-center">
        <div class="form-check form-switch">
          <input
            id="hideDisabledAddons"
            v-model="disabledAddons"
            class="form-check-input me-1"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="hideDisabledAddons">
            Hide Disabled Addons
            <small class="text-body-secondary ms-3">
              When enabled hides addons whose conditions are unmet
            </small>
          </label>
        </div>
      </li>
      <li
        v-if="isNil(viewerProjectList.default)"
        class="list-group-item flex items-center"
      >
        <select
          v-model="cyoaPreferences"
          class="form-select"
          aria-label="Default CYOA to load at Startup"
        >
          <option selected value="">No CYOA Loaded at Startup</option>
          <option
            v-for="projects in projectList.items"
            :key="projects.id"
            :value="projects.id"
          >
            {{ projects.title }}
          </option>
        </select>
      </li>
    </ul>
    <h5 class="text-center">Backpack</h5>
    <ul class="list-group list-group-flush">
      <li class="list-group-item flex items-center">
        <div class="form-check form-switch">
          <input
            id="showDisabledAddons"
            v-model="disabledAddonsInBackpack"
            class="form-check-input me-1"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label">
            Show Disabled Addons
            <small class="text-body-secondary ms-3">
              When disabled shows addons whose conditions are met
            </small>
          </label>
        </div>
      </li>
      <li class="list-group-item flex items-center">
        <div class="form-check form-switch">
          <input
            id="lockBackpackObjects"
            v-model="lockBackpackObjects"
            class="form-check-input me-1"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="lockBackpackObjects">
            Lock Objects in Backpack
          </label>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { isNil } from 'ramda';

import { useSettingRefs } from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';

const { viewerProjectList } = useViewerRefs();
const { cyoaPreference } = useSettingRefs();

const cyoaPreferences = computed({
  get: () => cyoaPreference.value,
  set: (value) => (cyoaPreference.value = value),
});

const projectList = computed(() => viewerProjectList.value);

const {
  disabledAddons,
  disabledAddonsInBackpack,
  lockBackpackObjects,
  lightThemeUI,
} = useSettingRefs();
</script>
