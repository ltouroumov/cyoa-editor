<template>
  <DynamicStyles :stylesheet="stylesheet" />
</template>

<script setup lang="ts">
import DynamicStyles from '~/components/utils/DynamicStyles.vue';
import {
  ObjStylesGen,
  ProjectStylesGen,
  RowStylesGen,
  createStyles,
} from '~/components/viewer/style/engine';
import type { ProjectStyles } from '~/composables/project/types/v1';

const { styles } = defineProps<{ styles: ProjectStyles }>();

const generators = [
  new ProjectStylesGen(),
  new RowStylesGen({ global: true }),
  new ObjStylesGen({ global: true }),
];
const stylesheet = computed(() => {
  return createStyles(styles, generators);
});
</script>

<style lang="scss">
.project-row {
  .row-title {
    font-family: var(--row-title-font);
    font-size: var(--row-title-size);
    text-align: var(--row-title-align);
    color: var(--row-title-color);
  }
  .row-text {
    font-family: var(--row-text-font);
    text-align: var(--row-text-align);
    font-size: var(--row-text-size);
    color: var(--row-text-color);
    padding: var(--row-text-padding-x) var(--row-text-padding-y);
  }
  .row-image {
    width: var(--row-image-width);
    margin-top: var(--row-image-margin-top);
    margin-bottom: var(--row-image-margin-bottom);

    overflow: var(--row-img-overflow);
    border: var(--row-img-border);
  }
  .row-header {
    background-color: var(--row-bg-color);
    margin-left: var(--row-margin);
    margin-right: var(--row-margin);
    border: var(--row-border);
    border-radius: var(--row-border-radius);
  }

  margin: var(--row-body-margin);
  overflow: var(--row-overflow);
}

.project-obj.obj-default {
  background-color: var(--obj-bg-color);

  .obj-title {
    font-family: var(--obj-title-font);
    font-size: var(--obj-title-size);
    color: var(--obj-title-color);
    text-align: var(--obj-title-align);
  }
  .obj-text {
    font-family: var(--obj-text-font);
    text-align: var(--obj-text-align);
    color: var(--obj-text-color);
    padding: var(--obj-text-padding);
    font-size: var(--obj-text-size);
  }
  .obj-image {
    width: var(--obj-image-width);
    margin-top: var(--obj-image-margin-top);
    margin-bottom: var(--obj-image-margin-bottom);
    object-fit: var(--obj-img-object-fit);
    height: var(--obj-img-object-height);
  }
  .addon {
    .text {
      font-family: var(--obj-addon-text-font);
      font-size: var(--obj-addon-text-size);
      color: var(--obj-addon-text-color);
      text-align: var(--obj-addon-text-align);
      padding: var(--obj-text-padding);
    }

    .title {
      font-family: var(--obj-addon-title-font) sans-serif;
      font-size: var(--obj-addon-title-size);
      color: var(--obj-addon-title-color);
      text-align: var(--obj-addon-title-align);
    }

    &.disabled {
      background-color: var(--obj-addon-disabled-bg-color);
      filter: var(--obj-addon-disabled-filter);
    }
  }

  .obj-score,
  .obj-requirements {
    font-family: var(--obj-score-font) sans-serif;
    font-size: var(--obj-score-size);
    text-align: var(--obj-score-align);
    color: var(--obj-score-color);
  }

  /* FIXME: Disabled as it messes up parent columns, appears related to grid.css
  margin: var(--obj-margin);
  */

  border: var(--obj-border);
  border-radius: var(--obj-border-radius);

  &.selected {
    background-color: var(--obj-selected-bg-color);
    filter: var(--obj-selected-filter);
  }
  &.disabled {
    background-color: var(--obj-disabled-bg-color);
    filter: var(--obj-disabled-filter);
  }
}
</style>
