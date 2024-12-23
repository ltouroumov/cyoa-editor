import { defineStore } from 'pinia';
import { prop } from 'ramda';

import {
  DefaultProjectConfig,
  DefaultProjectContent,
  DefaultProjectMedia,
  DefaultProjectStyles,
} from '~/composables/project/defaults';
import type {
  Project,
  ProjectConfig,
  ProjectContent,
  ProjectMedia,
  ProjectStyles,
} from '~/composables/project/types/v2';

export const useProjectStore = defineStore('project-v2', () => {
  const content = ref<ProjectContent>(DefaultProjectContent);
  const config = ref<ProjectConfig>(DefaultProjectConfig);
  const styles = ref<ProjectStyles>(DefaultProjectStyles);
  const media = ref<ProjectMedia>(DefaultProjectMedia);

  function loadData(project: Project) {
    content.value = project.content;
    config.value = project.config;
    styles.value = project.styles;
    media.value = project.media;
  }

  function clearData() {
    content.value = DefaultProjectContent;
    config.value = DefaultProjectConfig;
    styles.value = DefaultProjectStyles;
    media.value = DefaultProjectMedia;
  }

  function getChildrenIds(id: string): string[] {
    return prop(id, content.value.children) ?? [];
  }

  return {
    // Reactive Data
    content,
    config,
    styles,
    media,
    // Utility Functions
    loadData,
    clearData,
  };
});

export const useProjectStoreRefs = () => {
  return storeToRefs(useProjectStore());
};
