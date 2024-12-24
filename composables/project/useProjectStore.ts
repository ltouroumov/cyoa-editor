import { defineStore } from 'pinia';
import { clone, prop } from 'ramda';

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
import type {
  ChildObject,
  ObjectMap,
} from '~/composables/project/types/v2/objects';
import type { ObjectType } from '~/composables/project/types/v2/objects/base';

export const useProjectStore = defineStore('project-v2', () => {
  const content = ref<ProjectContent>(DefaultProjectContent);
  const config = ref<ProjectConfig>(DefaultProjectConfig);
  const styles = ref<ProjectStyles>(DefaultProjectStyles);
  const media = ref<ProjectMedia>(DefaultProjectMedia);

  function importData(project: Project) {
    content.value = project.content;
    config.value = project.config;
    styles.value = project.styles;
    media.value = project.media;
  }

  function exportData(): Project {
    return {
      content: clone(content.value),
      config: clone(config.value),
      styles: clone(styles.value),
      media: clone(media.value),
    };
  }

  function clearData() {
    content.value = DefaultProjectContent;
    config.value = DefaultProjectConfig;
    styles.value = DefaultProjectStyles;
    media.value = DefaultProjectMedia;
  }

  function get<T extends ObjectType>(
    id: string,
    type: T,
  ): ObjectMap[T] | undefined {
    const object = prop(id, content.value.objects);
    if (object.type === type) {
      return object as ObjectMap[T];
    } else {
      return undefined;
    }
  }

  function getChildren(id: string): ChildObject[] {
    return prop(id, content.value.children) ?? [];
  }

  return {
    // Reactive Data
    content,
    config,
    styles,
    media,
    // Getters
    get,
    getChildren,
    // Utility Functions
    importData,
    exportData,
    clearData,
  };
});

export const useProjectStoreRefs = () => {
  return storeToRefs(useProjectStore());
};
