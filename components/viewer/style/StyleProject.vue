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
