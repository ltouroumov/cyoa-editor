<template>
  <ProjectView v-if="isNotNil(project)" :project="project.data" />
  <ProjectLoadOverlay />
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import ProjectLoadOverlay from '~/components/viewer/ProjectLoadOverlay.vue';
import { useProjectRefs } from '~/composables/store/project';

const { project } = useProjectRefs();
</script>

<style lang="scss" scoped></style>
