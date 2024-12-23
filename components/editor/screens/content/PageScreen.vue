<template>
  <pre>{{ JSON.stringify(page) }}</pre>
  <pre v-for="page in children">{{ JSON.stringify(page) }}</pre>
</template>

<script setup lang="ts">
import { map } from 'ramda';

import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  pageId: string;
}>();

const page = computed(() => projectStore.content.entries[props.pageId]);
const children = computed(() => {
  return map((rowId) => {
    return projectStore.content.entries[rowId];
  }, projectStore.content.children[props.pageId] ?? []);
});
</script>

<style scoped lang="scss"></style>
