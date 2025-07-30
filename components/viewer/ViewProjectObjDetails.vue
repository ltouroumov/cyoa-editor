<template>
  <ViewProjectObj
    :obj="obj"
    :row="row"
    :allow-overflow="true"
    force-width="col-12"
  />
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';

const store = useProjectStore();
const $props = defineProps<{ objId: string }>();

const obj = computed(() => store.getObject($props.objId));
const row = computed(() => {
  const rowId = store.getObjectRow($props.objId);
  return store.getRow(rowId);
});
</script>

<style scoped lang="scss"></style>
