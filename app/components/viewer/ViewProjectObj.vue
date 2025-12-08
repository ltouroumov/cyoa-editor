<template>
  <div :id="`obj-${obj.id}`" :class="objClass">
    <StyleObj
      v-if="obj.isPrivateStyling"
      :styles="obj.styling"
      :obj-id="obj.id"
    />
    <div
      ref="objContainerRef"
      class="project-obj obj-default"
      :class="{
        selected: isSelected && !isInBackpack,
        disabled: !isEnabled,
        notSelectable: obj.isNotSelectable || row.isInfoRow,
        canToggle: canToggle,
        hideDisabledAddons: $props.display?.hideDisabledAddons,
        hasPrivateStyling: obj.isPrivateStyling,
      }"
      @click="toggle"
    >
      <div
        class="project-obj-content"
        :class="[objTemplateClass, objHeightClass]"
      >
        <div class="obj-image-wrapper">
          <img
            v-if="obj.image && !display?.hideObjectImages"
            class="obj-image"
            :decoding="alwaysEnable ? `sync` : `auto`"
            :loading="alwaysEnable ? `eager` : `lazy`"
            :src="obj.image"
            :href="objImageIsURL ? obj.image : ''"
            :alt="obj.title"
          />
        </div>
        <div class="obj-header">
          <div class="obj-title">
            {{ obj.title }}
          </div>
          <ProjectObjMulti
            v-if="obj.isSelectableMultiple"
            :obj="obj"
            :can-toggle="canToggle"
          />
          <ViewScores v-if="!display?.hideObjectScores" :scores="obj.scores" />
          <ViewRequirements
            v-if="!display?.hideObjectRequirements"
            :requireds="obj.requireds"
            :enable-show-more="true"
            @show-more="showParents()"
          />
        </div>
        <div
          ref="objContentRef"
          class="obj-content"
          :class="{ 'hide-overflow': objHideOverflow }"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="obj.text && !display?.hideObjectText"
            class="obj-text"
            v-html="formatText(obj.text)"
          ></div>
          <!-- eslint-enable vue/no-v-html -->
          <div v-if="objShowAddons" class="obj-addons">
            <LazyViewAddon
              v-for="(addon, idx) in obj.addons"
              :key="idx"
              :index="idx"
              :addon="addon"
              :obj-id="obj.id"
            />
          </div>
        </div>
        <div
          class="obj-controls"
          :class="{
            show: showControls,
            floating: showFloatingControls,
            sticky: showStickyControls,
          }"
          @click.stop.prevent="showMore()"
        >
          <div
            class="controls flex flex-row justify-center items-center cursor-pointer py-1"
          >
            <div class="scroll-btn flex flex-row items-center">
              <div
                class="iconify size-6 carbon--zoom-in bg-surface-200 text-surface-200"
              />
              <span v-if="isNotEmpty(obj.addons)">
                {{ length(obj.addons) }}
                {{ length(obj.addons) > 1 ? 'Addons' : 'Addon' }} ...
              </span>
              <span v-else>More ...</span>
            </div>
          </div>
          <div class="background"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { isEmpty, isNotEmpty, isNotNil, length } from 'ramda';

import StyleObj from './style/StyleObj.vue';

import ProjectObjMulti from '~/components/viewer/ProjectObjMulti.vue';
import { ObjectHeights, getSizeClasses } from '~/components/viewer/style/sizes';
import ViewScores from '~/components/viewer/ViewScores.vue';
import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useProjectStore } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';
import { useViewerStore } from '~/composables/store/viewer';
import { formatText } from '~/composables/text';
import { ViewContext } from '~/composables/viewer';
import { useObject } from '~/composables/viewer/useObject';

const LazyViewAddon = defineAsyncComponent(() => import('./ViewAddon.vue'));

const $props = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
  viewObject?: ViewContext;
  width?: string;
  forceWidth?: string;
  template?: string;
  display?: Partial<DisplaySettings>;
  allowOverflow?: boolean;
  showAddons?: boolean;
}>();

const _object = useObject({
  obj: computed(() => $props.obj),
  row: computed(() => $props.row),
  canToggle: computed(() => $props.viewObject !== ViewContext.BackpackDisabled),
});
const { isSelected, canToggle, toggle } = _object;

const objClass = computed(() => {
  if ($props.forceWidth) return [$props.forceWidth];
  return getSizeClasses($props.obj, $props.row, $props.width);
});
const objHeightClass = computed(() => {
  if ($props.allowOverflow) return null;
  if ($props.display?.showObjectOverflow) return null;

  let objectSize = $props.forceWidth ?? $props.row.objectWidth;
  if ($props.obj.objectWidth) {
    objectSize = $props.obj.objectWidth;
  }
  if ($props.width) {
    objectSize = $props.width;
  }

  if (objectSize in ObjectHeights) {
    return ObjectHeights[objectSize];
  } else {
    return 'mh-3';
  }
});
const objHideOverflow = computed(() => {
  if ($props.allowOverflow) return false;
  if ($props.display?.showObjectOverflow) return false;
  return true;
});
const objShowAddons = computed(() => {
  if ($props.showAddons) return true;
  if ($props.display?.showObjectAddons) return true;
  return false;
});

const objTemplateClass = computed(() => {
  // Allow to override the template
  // Used in the search results since the object view is always single-column
  switch ($props.template ?? $props.obj.template) {
    case '1':
      return 'obj-template-top';
    case '2':
      return 'obj-template-left';
    case '3':
      return 'obj-template-right';
  }

  return 'obj-template-top';
});

const objBgColor = computed(() => {
  if ($props.obj.isPrivateStyling) {
    if ($props.obj.styling.objectBgColorIsOn) {
      return $props.obj.styling.objectBgColor;
    } else {
      return 'transparent';
    }
  } else if ($props.row.styling?.objectBgColorIsOn) {
    return $props.row.styling.objectBgColor;
  } else if (isNotNil(store.project)) {
    if (store.project.data.styling.objectBgColorIsOn) {
      return store.project.data.styling.objectBgColor;
    } else {
      return 'transparent';
    }
  } else {
    return 'transparent';
  }
});

const objImageIsURL = computed(() => {
  return R.match(/^https?:\/\//, $props.obj.image);
});

const objContentRef = useTemplateRef('objContentRef');
const objContentSize = useElementSize(objContentRef);
const showControls = computed<boolean>(() => {
  if ($props.display?.showObjectControls === 'always') {
    return isNotEmpty($props.obj.text) || isNotEmpty($props.obj.addons);
  } else if ($props.display?.showObjectControls === 'never') {
    return false;
  } else if (isNotEmpty($props.obj.text) || isNotEmpty($props.obj.addons)) {
    // showObjectControls is 'auto'
    // Access these properties to trigger reactivity on changes
    const _ = [objContentSize.height.value, objContentSize.width.value];
    const objContentEl = objContentRef.value;
    if (!objContentEl) return false;
    return (
      !$props.allowOverflow &&
      (objContentEl.scrollHeight > objContentEl.clientHeight ||
        isNotEmpty($props.obj.addons))
    );
  } else {
    return false;
  }
});
const showFloatingControls = computed<boolean>(() => {
  return (
    $props.display?.showObjectControls === 'auto' ||
    $props.display?.showObjectControls === 'never' ||
    (isEmpty($props.obj.text) && isEmpty($props.obj.addons))
  );
});
const showStickyControls = computed<boolean>(() => {
  return (
    $props.display?.showObjectControls === 'always' && $props.allowOverflow
  );
});

const viewerStore = useViewerStore();
const showMore = () => {
  viewerStore.showObjectDetails = { id: $props.obj.id, tab: 'details' };
};
const showParents = () => {
  viewerStore.showObjectDetails = { id: $props.obj.id, tab: 'parents' };
};

const store = useProjectStore();

const isEnabled = computed<boolean>(() => {
  // Whether the object is always enabled or disabled based on the viewObject
  // Otherwise check the object conditions
  switch ($props.viewObject) {
    case ViewContext.BackpackEnabled:
    case ViewContext.BackpackDisabled:
      return true;
    default:
      return _object.isEnabled.value;
  }
});
const alwaysEnable = computed<boolean>(() => {
  switch ($props.viewObject) {
    case ViewContext.BackpackEnabled:
    case ViewContext.BackpackDisabled:
      return true;
    default:
      return false;
  }
});
const isInBackpack = computed<boolean>(() => {
  return (
    $props.viewObject === ViewContext.BackpackEnabled ||
    $props.viewObject === ViewContext.BackpackDisabled
  );
});
</script>

<style scoped lang="scss">
.project-obj.obj-default {
  --obj-bg-color: v-bind('objBgColor');
}
</style>

<style lang="scss">
.project-obj.obj-default {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.hideDisabledAddons {
    .addon.disabled {
      display: none;
    }
  }

  .project-obj-content {
    overflow: auto;
    position: relative;
    height: 100%;

    &.obj-template-top {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      grid-template-areas: 'image' 'header' 'content';
      align-content: start;
    }
    &.obj-template-left {
      display: grid;
      grid-template-columns: 1fr 2fr;
      grid-template-rows: auto 1fr;
      grid-template-areas: 'image header' 'image content';
      align-content: start;
    }
    &.obj-template-right {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: auto 1fr;
      grid-template-areas: 'header image' 'content image';
      align-content: start;
    }

    &.mh-12 {
      max-height: 1400px;
    }
    &.mh-9 {
      max-height: 1200px;
    }
    &.mh-6 {
      max-height: 1000px;
    }
    &.mh-3 {
      max-height: 900px;
    }
  }

  .obj-image-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;

    grid-area: image;
  }
  .obj-image {
    width: 100%;
    object-fit: contain;
  }

  .obj-header {
    grid-area: header;
    margin-top: 5px;
    margin-bottom: 5px;

    .obj-title {
      margin-bottom: 5px;
      margin-left: 5px;
      margin-right: 5px;
    }

    .obj-select-multi {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }
  .obj-content {
    grid-area: content;

    &.hide-overflow {
      overflow-x: hidden;
      overflow-y: hidden;
    }
  }

  .obj-controls {
    visibility: hidden;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &.floating {
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      z-index: 10;

      height: 3rem;
      .controls {
        padding-top: 1rem;
      }
    }

    &.sticky {
      position: sticky;
      bottom: 0;
      right: 0;
      left: 0;
      z-index: 10;

      height: 3rem;
      .controls {
        padding-top: 1rem;
      }
    }

    &.show {
      visibility: visible;
    }

    .background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        180deg,
        rgba(from var(--obj-bg-color) r g b / 0%) 0%,
        rgba(from var(--obj-bg-color) r g b / 75%) 1.5rem,
        rgba(from var(--obj-bg-color) r g b / 100%) 100%
      );
      z-index: -1;
    }

    .controls {
      color: var(--p-surface-200);
      z-index: 10;
    }
  }
}

@media screen and (min-width: 768px) {
  $widths: (
    20: 20%,
    14: 14%,
    12: 12%,
    11: 11%,
    10: 10%,
    9: 9%,
  );

  @each $width, $size in $widths {
    .w-md-#{$width} {
      flex: 0 0 $size !important;
      max-width: $size !important;
    }
  }
}
</style>
