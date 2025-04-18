<template>
  <div>
    <h2 class="text-2xl font-bold text-primary">Featured Projects</h2>
    <ProjectCollection :project-list="projectList" />
  </div>
  <div
    v-if="projectList.show_load_file"
    class="pt-4 border-t border-surface-700"
  >
    <h2 class="text-2xl font-bold text-primary">Load File</h2>
    <LoadProject />
  </div>
</template>

<script setup lang="ts">
import ProjectCollection from '~/components/viewer/menu/ProjectCollection.vue';
import type { ViewerProjectList } from '~/composables/viewer';

const { projectList } = defineProps<{
  projectList: ViewerProjectList;
}>();
</script>
