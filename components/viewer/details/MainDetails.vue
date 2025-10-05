<template>
  <div
    class="obj-details-contents flex flex-col gap-2 flex-auto z-10 relative pt-[60px] md:pt-[120px]"
    :class="{
      selected: isSelected,
      disabled: !isEnabled,
      notSelectable: obj.isNotSelectable || row.isInfoRow,
      canToggle: canToggle,
      hasPrivateStyling: obj.isPrivateStyling,
    }"
    @click.capture="toggle"
  >
    <div class="obj-header">
      <div class="obj-title">
        {{ obj.title }}
      </div>
      <ProjectObjMulti v-if="obj.isSelectableMultiple" :obj="obj" />
      <ViewScores :scores="obj.scores" />
      <ViewRequirements
        :requireds="obj.requireds"
        :enable-show-more="true"
        @show-more="showParents()"
      />
    </div>
    <div ref="objContentRef" class="obj-content">
      <!-- eslint-disable vue/no-v-html -->
      <div v-if="obj.text" class="obj-text" v-html="formatText(obj.text)"></div>
      <!-- eslint-enable vue/no-v-html -->
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectObjMulti from '~/components/viewer/ProjectObjMulti.vue';
import ViewScores from '~/components/viewer/ViewScores.vue';
import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useViewerStore } from '~/composables/store/viewer';
import { formatText } from '~/composables/text';
import { useObject } from '~/composables/viewer/useObject';

const $props = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
}>();

const { isEnabled, isSelected, canToggle, toggle } = useObject({
  obj: computed(() => $props.obj),
  row: computed(() => $props.row),
});

const viewerStore = useViewerStore();
const showParents = () => {
  viewerStore.showObjectDetails = { id: $props.obj.id, tab: 'parents' };
};
</script>

<style scoped lang="scss">
.obj-details-contents {
  //background-image: var(--bg-gradient);

  .obj-header {
    margin-top: 5px;
    margin-bottom: 5px;
    padding-left: 10px;
    padding-right: 10px;

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

  .obj-title {
    font-family: var(--obj-title-font) sans-serif;
    font-size: var(--obj-title-size);
    color: var(--obj-title-color);
    text-align: var(--obj-title-align);
  }
  .obj-text {
    font-family: var(--obj-text-font) sans-serif;
    text-align: var(--obj-text-align);
    color: var(--obj-text-color);
    padding: var(--obj-text-padding);
    font-size: var(--obj-text-size);
  }

  :deep(.obj-score),
  :deep(.obj-requirements) {
    font-family: var(--obj-score-font) sans-serif;
    font-size: var(--obj-score-size);
    text-align: var(--obj-score-align);
    color: var(--obj-score-color);
  }

  &.selected {
    --bg-gradient: linear-gradient(
      180deg,
      rgba(from var(--obj-selected-bg-color) r g b / 0%) 0px,
      rgba(from var(--obj-selected-bg-color) r g b / 75%) 100px,
      rgba(from var(--obj-selected-bg-color) r g b / 75%) 150px,
      rgba(from var(--obj-selected-bg-color) r g b / 100%) 250px,
      var(--obj-selected-bg-color) 100%
    );
    filter: var(--obj-selected-filter);
  }
  &.disabled {
    --bg-gradient: linear-gradient(
      180deg,
      rgba(from var(--obj-disabled-bg-color) r g b / 0%) 0px,
      rgba(from var(--obj-disabled-bg-color) r g b / 75%) 100px,
      rgba(from var(--obj-disabled-bg-color) r g b / 75%) 150px,
      rgba(from var(--obj-disabled-bg-color) r g b / 100%) 250px,
      var(--obj-disabled-bg-color) 100%
    );
    filter: var(--obj-disabled-filter);
  }
}
</style>
