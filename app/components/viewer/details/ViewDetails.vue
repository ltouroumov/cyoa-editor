<template>
  <div
    class="project-obj obj-details w-full lg:w-[60rem] h-full overflow-auto flex flex-col md:flex-row relative"
  >
    <div
      v-if="obj.image && !display.hideObjectImages"
      class="obj-image-wrapper absolute top-0 left-0 right-0 bottom-0 overflow-hidden z-0"
    >
      <img
        class="obj-image w-full"
        :decoding="`sync`"
        :loading="`eager`"
        :src="obj.image"
        :href="objImageIsURL ? obj.image : ''"
        :alt="obj.title"
      />
    </div>

    <div
      class="obj-image-gradient-content absolute top-0 left-0 bottom-0 w-full md:w-2/3 h-3/4 md:h-full z-5"
    />
    <div
      class="obj-image-gradient-controls absolute md:top-0 right-0 bottom-0 w-full md:w-1/3 md:h-full h-1/4 z-5"
    />

    <div class="overflow-auto w-auto md:w-2/3 h-3/4 md:h-auto relative z-10">
      <MainDetails
        :class="{ hidden: showTab !== 'main' }"
        :row="row"
        :obj="obj"
      />
      <AddonDetails
        v-if="showTab === 'addon' && showAddon !== null"
        :addon="showAddon.data"
        :index="showAddon.index"
        :obj-id="obj.id"
      />
    </div>
    <div
      class="obj-details-controls flex flex-col gap-2 md:w-1/3 h-1/4 md:h-auto relative z-10 p-2 md:pt-[120px] overflow-auto"
    >
      <div
        class="details-entry flex flex-row items-center gap-2"
        @click="selectTab('main')"
      >
        <div
          class="size-4 flex-none iconify carbon--cube"
          :class="{ 'text-emerald-500': isChoiceSelected }"
        />
        <div class="flex-auto label font-bold">{{ obj.title }}</div>
        <div
          class="size-4 iconify carbon--chevron-left"
          :class="{ invisible: showTab !== 'main' }"
        />
      </div>
      <div class="my-1 border-t sep"></div>
      <div v-if="obj.addons.length === 0" class="flex flex-col">
        <span class="text-surface-700">No Addons</span>
      </div>
      <div
        v-for="(addon, idx) in obj.addons"
        :key="idx"
        class="details-entry flex flex-col items-start cursor-pointer"
        @click="selectTab('addon', idx)"
      >
        <div v-if="idx > 0" class="mb-2 px-6 w-full">
          <div class="border-t sep w-full"></div>
        </div>
        <div class="flex flex-row items-center gap-2 w-full">
          <div
            class="size-4 flex-none iconify carbon--hexagon-vertical-outline"
            :class="{ 'text-emerald-500': addonStates[idx].value }"
          />
          <div class="flex-auto label">{{ addon.title }}</div>
          <div
            class="size-4 iconify carbon--chevron-left"
            :class="{
              invisible: !(showTab === 'addon' && showAddonIdx === idx),
            }"
          />
        </div>
        <div class="reqs mx-6 text-surface-500 text-sm">
          <ViewRequirements
            :requireds="addon.requireds"
            :show-always="true"
            class="left"
          />
        </div>
      </div>
    </div>
    <slot name="right" />
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import type { ComputedRef } from 'vue';

import AddonDetails from '~/components/viewer/details/AddonDetails.vue';
import MainDetails from '~/components/viewer/details/MainDetails.vue';
import { buildConditions } from '~/composables/conditions';
import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const $props = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
  display: DisplaySettings;
}>();

const objImageIsURL = computed(() => {
  return R.match(/^https?:\/\//, $props.obj.image);
});

const showTab = ref<'main' | 'addon'>('main');
const showAddonIdx = ref<number>(-1);
const showAddon = computed(() => ({
  index: showAddonIdx.value,
  data: $props.obj.addons[showAddonIdx.value],
}));

const addonStates = computed(() => {
  const states: Record<number, ComputedRef<boolean>> = {};
  for (let idx = 0; idx < R.length($props.obj.addons); idx++) {
    const addon = $props.obj.addons[idx];
    const condition = buildConditions(addon);
    const isEnabled = computed(() => condition(selectedIds.value));
    states[idx] = isEnabled;
  }
  return states;
});

const isChoiceSelected = computed<boolean>(() => {
  return R.has($props.obj.id, selected.value);
});

function selectTab(tab: 'main' | 'addon', idx?: number) {
  if (tab === 'main') {
    showTab.value = 'main';
    showAddonIdx.value = -1;
  } else if (tab === 'addon') {
    showTab.value = 'addon';
    showAddonIdx.value = idx ?? -1;
  }
}
</script>

<style scoped lang="scss">
.project-obj.obj-details {
  background-color: var(--obj-bg-color);
  border: var(--obj-border);
  border-radius: var(--obj-border-radius);

  --bg-gradient: linear-gradient(
    180deg,
    rgba(from var(--obj-bg-color) r g b / 50%) 0px,
    rgba(from var(--obj-bg-color) r g b / 75%) 100px,
    rgba(from var(--obj-bg-color) r g b / 90%) 150px,
    rgba(from var(--obj-bg-color) r g b / 100%) 200px,
    rgba(from var(--obj-bg-color) r g b / 100%) 100%
  );
}

.obj-image-gradient-content {
  background-image: var(--bg-gradient);

  &:has(~ div .obj-addon-details.disabled:not(.hidden)) {
    --bg-gradient: linear-gradient(
      180deg,
      rgba(from var(--obj-addon-disabled-bg-color) r g b / 0%) 0px,
      rgba(from var(--obj-addon-disabled-bg-color) r g b / 75%) 100px,
      rgba(from var(--obj-addon-disabled-bg-color) r g b / 75%) 150px,
      rgba(from var(--obj-addon-disabled-bg-color) r g b / 100%) 250px,
      var(--obj-addon-disabled-bg-color) 100%
    );
  }

  &:has(~ div .obj-details-contents.selected:not(.hidden)) {
    --bg-gradient: linear-gradient(
      180deg,
      rgba(from var(--obj-selected-bg-color) r g b / 0%) 0px,
      rgba(from var(--obj-selected-bg-color) r g b / 75%) 100px,
      rgba(from var(--obj-selected-bg-color) r g b / 75%) 150px,
      rgba(from var(--obj-selected-bg-color) r g b / 100%) 250px,
      var(--obj-selected-bg-color) 100%
    );
  }
  &:has(~ div .obj-details-contents.disabled) {
    --bg-gradient: linear-gradient(
      180deg,
      rgba(from var(--obj-disabled-bg-color) r g b / 0%) 0px,
      rgba(from var(--obj-disabled-bg-color) r g b / 75%) 100px,
      rgba(from var(--obj-disabled-bg-color) r g b / 75%) 150px,
      rgba(from var(--obj-disabled-bg-color) r g b / 100%) 250px,
      var(--obj-disabled-bg-color) 100%
    );
  }
}
.obj-image-gradient-controls {
  background-image: var(--bg-gradient);
}

.obj-details-controls {
  //background-image: var(--bg-gradient);
  color: var(--obj-title-color);

  .details-entry {
    font-family: var(--obj-title-font) sans-serif;
    color: var(--obj-title-color);
  }
}

.sep {
  border-color: var(--p-surface-500);
}

.label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
