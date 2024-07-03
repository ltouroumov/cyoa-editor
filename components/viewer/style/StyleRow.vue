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
import { RowStyles } from '~/composables/project';

const { styles } = defineProps<{ styles: RowStyles }>();

const generators = [new RowStylesGen(), new ObjStylesGen()];
const stylesheet = computed(() => {
  return createStyles(styles, generators);
});
</script>
