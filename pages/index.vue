<template>
  <ProjectViewWrapper />
  <div v-if="store.status === 'empty'" class="dialog-container">
    <div class="bg-dark-subtle dialog text-light">
      <ProjectMenu :project-list="projectList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';
import ProjectViewWrapper from '~/components/viewer/ProjectViewWrapper.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs } from '~/composables/store/viewer';

const { store, buildModified } = useProjectRefs();
const { viewerProjectList } = useViewerRefs();

const projectList = computed(() => viewerProjectList.value);

definePageMeta({
  layout: false,
});
useHead({
  bodyAttrs: {
    'data-bs-theme': 'dark',
  },
});

onMounted(() => {
  window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
    if (buildModified.value) {
      event.preventDefault();
      return true;
    } else {
      return false;
    }
  });
});
</script>

<style lang="scss">
@import '~/assets/css/bootstrap/config';

html {
  font-size: 16px;
}

.dialog-container {
  min-height: 50vh;
  margin-top: 5em;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .dialog {
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
  }
}

@media screen and (max-width: 768px) {
  .dialog {
    width: 100% !important;
    max-width: 100%;
  }
}
</style>
