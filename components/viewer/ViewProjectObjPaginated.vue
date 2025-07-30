<template>
  <div :id="`obj-${obj.id}`" :class="objClass">
    <StyleObj
      v-if="obj.isPrivateStyling"
      :styles="obj.styling"
      :obj-id="obj.id"
    />
    <div
      class="project-obj"
      :class="{
        selected: isSelected && !isInBackpack,
        disabled: !isEnabled,
        notSelectable: obj.isNotSelectable || row.isInfoRow,
        canToggle: canToggle,
        hideDisabledAddons: $props.display?.hideDisabledAddons,
        hasPrivateStyling: obj.isPrivateStyling,
        'paginated-object': shouldPaginate,
      }"
      @click="handleObjectClick"
    >
      <div
        class="project-obj-content"
        :class="{ objTemplateClass, 'paginated-active': shouldPaginate }"
      >
        <div class="object-content-wrapper">
          <div class="common-content-header">
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
            <div v-if="currentContentSource === 'main'" class="obj-content">
              <div class="obj-title">
                {{ obj.title }}
              </div>
              <template v-if="obj.isSelectableMultiple">
                <div class="obj-select-multi">
                  <div
                    v-if="canToggle"
                    class="iconify carbon--subtract-alt text-xl"
                    :class="{
                      'text-green-400': selectedAmount > minSelectedAmount,
                      'text-grey-400': selectedAmount <= minSelectedAmount,
                    }"
                    @click="decrement"
                  />
                  <span class="mx-1">{{ selectedAmount }}</span>
                  <div
                    v-if="canToggle"
                    class="iconify carbon--add-alt text-xl"
                    :class="{
                      'text-green-400': selectedAmount < maxSelectedAmount,
                      'text-grey-400': selectedAmount >= minSelectedAmount,
                    }"
                    @click="increment"
                  />
                </div>
              </template>
              <ViewScores
                v-if="!display?.hideObjectScores"
                :scores="obj.scores"
              />
              <ViewRequirements
                v-if="!display?.hideObjectRequirements"
                :requireds="obj.requireds"
              />
            </div>
            <div v-else-if="currentAddon" class="addon-content-header">
              <h5 class="obj-title">{{ currentAddon.title }}</h5>
              <ViewRequirements
                v-if="!display?.hideAddonRequirements"
                :requireds="currentAddon.requireds"
                :show-always="true"
              />
            </div>
          </div>
          <div v-if="currentContentSource === 'main'">
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-if="obj.text && !display?.hideObjectText"
              class="obj-text"
              v-html="paginatedText"
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
          <div v-else-if="currentAddon">
            <div class="addon-content">
              <!-- eslint-disable vue/no-v-html -->
              <div
                v-if="currentAddon.text"
                class="obj-text"
                v-html="paginatedText"
              ></div>
              <!-- eslint-enable vue/no-v-html -->
            </div>
          </div>
        </div>
        <div v-if="shouldPaginate" class="bottom-bar">
          <Button
            label=""
            icon="pi pi-arrow-left"
            class="p-button-secondary"
            :disabled="!isEnabled || currentContentPage === 0"
            @click.stop="currentContentPage--"
          />
          <Button
            label=""
            icon="pi pi-bars"
            class="p-button-secondary"
            :disabled="!isEnabled || obj.addons.length === 0"
            @click.stop="showAddonsSidebar = !showAddonsSidebar"
          />
          <Button
            label=""
            icon="pi pi-home"
            class="p-button-secondary"
            :disabled="
              !isEnabled ||
              (currentContentSource === 'main' && currentContentPage === 0)
            "
            @click.stop="
              currentContentSource = 'main';
              currentContentPage = 0;
            "
          />
          <Button
            label=""
            icon="pi pi-arrow-right"
            class="p-button-secondary"
            :disabled="
              !isEnabled ||
              currentContentPage >= totalContentPages - 1 ||
              totalContentPages === 0
            "
            @click.stop="currentContentPage++"
          />
        </div>
        <div
          v-if="showAddonsSidebar && obj.addons.length > 0"
          class="addons-sidebar"
          @click.stop
        >
          <div class="sidebar-header">
            <h5 class="text-xl text-primary font-bold">Add-ons</h5>
            <Button
              icon="pi pi-times"
              class="p-button-text p-button-plain"
              @click.stop="showAddonsSidebar = false"
            />
          </div>
          <div class="sidebar-content">
            <div
              v-for="({ addon, enabled }, idx) in addonsWithState"
              v-show="!$props.display?.hideDisabledAddons || enabled"
              :key="idx"
              class="addon-item"
              :class="{ 'disabled-addon': !enabled }"
              @click.stop="selectAddon(addon)"
            >
              {{ addon.title }}
              <span
                v-if="!enabled && !$props.display?.hideDisabledAddons"
                class="disabled-indicator"
              >
                (Disabled)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import StyleObj from './style/StyleObj.vue';

import { ObjectSizes } from '~/components/viewer/style/sizes';
import ViewRequirements from '~/components/viewer/ViewRequirements.vue';
import ViewScores from '~/components/viewer/ViewScores.vue';
import { buildConditions } from '~/composables/conditions';
import type {
  ObjAddon,
  ProjectObj,
  ProjectRow,
} from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';
import { formatText } from '~/composables/text';
import { ViewContext } from '~/composables/viewer';

const $props = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
  viewObject?: ViewContext;
  width?: string;
  forceWidth?: string;
  template?: string;
  display?: DisplaySettings;
}>();

const objClass = computed(() => {
  if ($props.forceWidth) return ['col', { [$props.forceWidth]: true }];

  let objectSize = $props.row.objectWidth;
  if ($props.obj.objectWidth) {
    objectSize = $props.obj.objectWidth;
  }
  if ($props.width) {
    objectSize = $props.width;
  }

  if (objectSize in ObjectSizes) {
    const classes = ObjectSizes[objectSize];
    return ['col', 'col-12', ...classes];
  } else {
    console.log(`Missing size reducer for ${objectSize}`);
    return ['col', 'col-12', objectSize];
  }
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

const objImageIsURL = computed(() => {
  return (
    $props.obj.image?.startsWith('http://') ||
    $props.obj.image?.startsWith('https://')
  );
});

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const condition = buildConditions($props.obj);

const isEnabled = computed<boolean>(() => {
  // Whether the object is always enabled or disabled based on the viewObject
  // Otherwise check the object conditions
  switch ($props.viewObject) {
    case ViewContext.BackpackEnabled:
    case ViewContext.BackpackDisabled:
      return true;
    default:
      return condition(selectedIds.value);
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
const canToggle = computed<boolean>(() => {
  return (
    isEnabled.value &&
    !$props.obj.isNotSelectable &&
    !$props.row.isInfoRow &&
    $props.viewObject !== ViewContext.BackpackDisabled
  );
});
const isInBackpack = computed<boolean>(() => {
  return (
    $props.viewObject === ViewContext.BackpackEnabled ||
    $props.viewObject === ViewContext.BackpackDisabled
  );
});
const isSelected = computed(() => selected.value[$props.obj.id] != undefined);

const selectedAmount = computed(() => {
  if ($props.obj.isSelectableMultiple)
    return selected.value[$props.obj.id] ?? 0;
  else return 0;
});

const minSelectedAmount = computed(() => +$props.obj.numMultipleTimesMinus);
const maxSelectedAmount = computed(() => +$props.obj.numMultipleTimesPluss);

const increment = () => {
  if (canToggle.value) {
    store.incSelected($props.obj.id);
  }
};
const decrement = () => {
  if (canToggle.value) {
    store.decSelected($props.obj.id);
  }
};

//--------------------- Pagination UI Changes-------------------------

const cache = new Map<string, any>();

onUnmounted(() => {
  cache.clear();
});

const WORDS_PER_PAGE = 75;

const { isObjectPaginated } = useViewerRefs();

const currentContentPage = ref(0);
type ContentSource = 'main' | ObjAddon;
const currentContentSource = ref<ContentSource>('main');
const showAddonsSidebar = ref(false);

const currentTextContent = computed(() => {
  if (currentContentSource.value === 'main') {
    return ($props.obj.text ?? '').trim();
  } else {
    return (currentContentSource.value.text ?? '').trim();
  }
});

const paginatedContent = computed(() => {
  const text = currentTextContent.value;
  const key = `${currentContentSource.value === 'main' ? 'main' : currentContentSource.value.title}:${text}`;
  let cachedResult = cache.get(key);
  if (cachedResult) return cachedResult;

  const words = text ? text.split(/\s+/) : [];
  const pages: string[] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push(words.slice(i, i + WORDS_PER_PAGE).join(' '));
  }
  cachedResult = { words, pages, total: pages.length };
  cache.set(key, cachedResult);
  return cachedResult;
});

const totalWordCount = computed(() => paginatedContent.value.words.length);
const totalContentPages = computed(() => paginatedContent.value.pages.length);

const shouldPaginate = computed(() => {
  if (
    !isObjectPaginated.value ||
    $props.obj.isNotSelectable ||
    $props.row.isInfoRow
  )
    return false;
  return $props.obj.addons.length > 0 || totalWordCount.value >= WORDS_PER_PAGE;
});

const addonsWithState = computed(() => {
  const key = `${$props.obj.id}:${selectedIds.value.join(',')}`;
  let cachedResult = cache.get(key);
  if (cachedResult) return cachedResult;

  cachedResult = $props.obj.addons.map((addon) => ({
    addon,
    enabled: buildConditions(addon)(selectedIds.value),
  }));
  cache.set(key, cachedResult);
  return cachedResult;
});

const currentAddon = computed(() =>
  currentContentSource.value !== 'main' ? currentContentSource.value : null,
);

watch(currentContentSource, () => {
  if (currentContentPage.value != 0) {
    currentContentPage.value = 0;
  }
});

const paginatedText = computed(() => {
  const pages = paginatedContent.value.pages;
  const raw =
    !shouldPaginate.value || pages.length === 0
      ? currentTextContent.value
      : pages[currentContentPage.value] || '';
  return formatText(raw);
});

const selectAddon = (addon: ObjAddon) => {
  currentContentSource.value = addon;
  showAddonsSidebar.value = false;
};

const handleObjectClick = (event: MouseEvent) => {
  if (showAddonsSidebar.value && event.target === event.currentTarget) {
    showAddonsSidebar.value = false;
  } else if (canToggle.value && !$props.obj.isSelectableMultiple) {
    store.setSelected($props.obj.id, !isSelected.value);
  }
};
</script>

<style lang="scss">
.project-obj {
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

    &.obj-template-top {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas: 'image' 'text';
    }
    &.obj-template-left {
      display: grid;
      grid-template-columns: 1fr 2fr;
      grid-template-rows: 1fr;
      grid-template-areas: 'image text';
    }
    &.obj-template-right {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: 'text image';
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

  .obj-content {
    overflow-x: auto;
    grid-area: text;

    .obj-title {
      margin-bottom: 5px;
    }

    .obj-select-multi {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }

  &.paginated-object {
    overflow-y: hidden;
    .project-obj-content.paginated-active {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      height: 100%;
    }
  }

  .disabled-addon {
    color: var(--p-text-color-secondary);
    font-style: italic;
  }

  .disabled-indicator {
    font-size: 0.8em;
    margin-left: 0.5em;
    color: var(--p-red-500);
  }

  .common-content-header,
  .addon-content-header {
    padding: 1rem;
  }

  .object-content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding-bottom: var(--bottom-bar-height, 2.5rem);
  }

  .addon-content {
    padding: 1rem;
  }

  .bottom-bar {
    position: sticky;
    bottom: 0;
    height: var(--bottom-bar-height, 2.5rem);
    background-color: var(--surface-ground);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
    z-index: 48;

    .p-button {
      flex-grow: 1;
      border-radius: 0;
      padding: 0.75rem 0;
      height: 100%;
    }

    .p-button:not(:last-child) {
      border-right: 1px solid var(--p-content-border-color);
    }
  }

  .addons-sidebar {
    position: absolute;
    top: 0;
    right: 0;
    width: 250px;
    height: 100%;
    background-color: var(--surface-ground, #18181b);
    opacity: 1 !important;
    border-left: 1px solid var(--p-content-border-color);
    z-index: 49;
    display: flex;
    flex-direction: column;

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--p-content-border-color);
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;

      .addon-item {
        padding: 0.5rem;
        cursor: pointer;

        &:hover {
          background-color: var(--surface-700);
        }
      }
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
