<template>
  <div>
    <h4 class="text-center">Viewer Settings</h4>
    <ul class="list-group mb-5 shadow">
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="form-check form-switch">
          <input
            id="hideDisabledAddons"
            class="form-check-input me-1"
            type="checkbox"
            role="switch"
            :checked="hideDisabledAddons"
            @change="toggleHideDisabledAddons()"
          />
          <label class="form-check-label" for="hideDisabledAddons"
            >Disable Addons
            <small class="text-body-secondary ms-3"
              >When enabled hides addons whose conditions are unmet</small
            >
          </label>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { hideDisabledAddons } = useViewerRefs();
const { toggleHideDisabledAddons } = useViewerStore();
</script>
