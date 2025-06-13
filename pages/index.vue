<template>
  <ProjectViewWrapper />
  <ProjectMenu
    v-if="store.status === 'empty'"
    :project-list="viewerProjectList"
  />
</template>

<script setup lang="ts">
import { assoc, concat, mergeDeepRight } from 'ramda';

import { definePageMeta } from '#imports';
import ProjectViewWrapper from '~/components/viewer/ProjectViewWrapper.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useSettingRefs } from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';

const { store, buildModified } = useProjectRefs();
const { viewerProjectList } = useViewerRefs();
const { lightThemeUI } = useSettingRefs();

const _config = useRuntimeConfig();
const { data: projectList } = await useAsyncData(
  'projects',
  async (): Promise<ViewerProjectList> => {
    const response: ViewerProjectList = await $fetch(
      `${_config.app.baseURL}config/viewer/projects.json`,
    );

    if (response.remote) {
      const remote: ViewerProjectList = await $fetch(response.remote);
      const items = concat(response.items, remote.items);
      return assoc('items', items, mergeDeepRight(response, remote));
    } else {
      return response;
    }
  },
);

if (projectList.value) {
  viewerProjectList.value = projectList.value;
}

definePageMeta({
  layout: false,
});

function setBodyTheme(lightTheme: boolean) {
  if (lightTheme) {
    document.body.setAttribute('data-bs-theme', 'light');
  } else {
    document.body.setAttribute('data-bs-theme', 'dark');
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
    if (buildModified.value) {
      event.preventDefault();
      return true;
    } else {
      return false;
    }
  });

  const lightTheme = lightThemeUI.value;
  setBodyTheme(lightTheme);
});

watch(
  () => lightThemeUI.value,
  (newValue: boolean) => {
    setBodyTheme(newValue);
  },
);
</script>

<style lang="scss">
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
