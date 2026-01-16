<template>
  <div class="flex flex-col gap-4">
    <EditSimpleHeaderStyle :style-id="styleId" />
    <EditSimpleContentStyle :style-id="styleId" />
  </div>
</template>

<script setup lang="ts">
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';
import { useProjectStore } from '~/composables/project/useProjectStore';
const projectStore = useProjectStore();

const props = defineProps<{
  styleId: string;
}>();

const style = computed((): AnySimpleStyle => {
  return projectStore.styles.rules[props.styleId] as AnySimpleStyle;
});
</script>

<style scoped lang="scss"></style>
