<template>
  <div
    class="project-obj-details w-1/2 h-full overflow-auto flex flex-row relative"
  >
    <div
      class="obj-image-wrapper absolute top-0 left-0 right-0 bottom-0 overflow-hidden z-0"
    >
      <img
        v-if="obj.image"
        class="obj-image w-full"
        :decoding="`sync`"
        :loading="`eager`"
        :src="obj.image"
        :href="objImageIsURL ? obj.image : ''"
        :alt="obj.title"
      />
    </div>

    <div
      class="obj-image-gradient-content absolute top-0 left-0 bottom-0 w-2/3 z-5"
    />
    <div
      class="obj-image-gradient-controls absolute top-0 right-0 bottom-0 w-1/3 z-5"
    />
    <div class="overflow-auto w-2/3 relative">
      <MainDetails
        :class="{ hidden: showTab !== 'main' }"
        :row="row"
        :obj="obj"
      />
      <AddonDetails
        v-if="showTab === 'addon' && showAddon !== null"
        :addon="showAddon"
      />
    </div>
    <div
      class="obj-details-controls flex flex-col gap-2 flex-auto relative z-10 p-2 pt-[120px]"
    >
      <div
        class="details-entry flex flex-row items-center gap-2"
        @click="selectTab('main')"
      >
        <div class="iconify carbon--cube" />
        <div class="flex-auto">{{ obj.title }}</div>
        <div v-show="showTab === 'main'" class="iconify carbon--chevron-left" />
      </div>
      <div class="my-1 border-t sep"></div>
      <div
        v-for="(addon, idx) in obj.addons"
        :key="idx"
        class="details-entry flex flex-row items-center gap-2"
        @click="selectTab('addon', idx)"
      >
        <div class="iconify carbon--hexagon-vertical-outline" />
        <div class="flex-auto">{{ addon.title }}</div>
        <div
          v-show="showTab === 'addon' && showAddonIdx === idx"
          class="iconify carbon--chevron-left"
        />
      </div>
    </div>
    <slot name="right" />
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';

import AddonDetails from '~/components/viewer/details/AddonDetails.vue';
import MainDetails from '~/components/viewer/details/MainDetails.vue';
import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const $props = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
}>();

const objImageIsURL = computed(() => {
  return R.match(/^https?:\/\//, $props.obj.image);
});

const showTab = ref<'main' | 'addon'>('main');
const showAddonIdx = ref<number>(-1);
const showAddon = computed(() => $props.obj.addons[showAddonIdx.value]);

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
.project-obj-details {
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

  .sep {
    border-color: var(--p-surface-500);
  }
}
</style>
