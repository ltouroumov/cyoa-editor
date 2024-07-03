<template>
  <DynamicStyles :stylesheet="stylesheet" />
</template>

<script setup lang="ts">
import DynamicStyles from '~/components/utils/DynamicStyles.vue';
import { ObjStylesGen, createStyles } from '~/components/viewer/style/engine';
import { ObjStyles } from '~/composables/project';

const { styles } = defineProps<{ styles: ObjStyles }>();

const generators = [new ObjStylesGen()];
const stylesheet = computed(() => {
  return createStyles(styles, generators);
});
</script>
