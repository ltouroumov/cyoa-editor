<template>
  <DynamicStyles :stylesheet="stylesheet" />
</template>

<script setup lang="ts">
import DynamicStyles from '~/components/utils/DynamicStyles.vue';
import {
  ObjStylesGen,
  RowStylesGen,
  createStyles,
} from '~/components/viewer/style/engine';
import type { RowStyles } from '~/composables/project';

const { styles, rowId } = defineProps<{ styles: RowStyles; rowId: string }>();

const generators = [
  new RowStylesGen({ container: `#row-${rowId}` }),
  new ObjStylesGen(),
];
const stylesheet = computed(() => {
  return createStyles(styles, generators);
});
</script>
