import { defineStore } from 'pinia';
import { clone, isNil, reverse, unfold } from 'ramda';

import {
  DefaultProject,
  DefaultProjectConfig,
  DefaultProjectMedia,
  DefaultProjectStyles,
} from '~/composables/project/defaults';
import type {
  Project,
  ProjectConfig,
  ProjectMedia,
  ProjectStyles,
} from '~/composables/project/types/v2';
import type {
  AnyObject,
  ChildObject,
  ObjectMap,
} from '~/composables/project/types/v2/objects';
import type { ObjectType } from '~/composables/project/types/v2/objects/base';
import type { ProjectScore } from '~/composables/project/types/v2/score';

function copyToMap<V>(data: Record<string, V>): Map<string, V> {
  return new Map(Object.entries(data));
}

function copyToObject<V>(data: Map<string, V>): Record<string, V> {
  return Object.fromEntries(data.entries());
}

export const useProjectStore = defineStore('project-v2', () => {
  const objects = ref<Map<string, AnyObject>>(new Map());
  const children = ref<Map<string, ChildObject[]>>(new Map());
  const scores = ref<Map<string, ProjectScore>>(new Map());

  const config = ref<ProjectConfig>(DefaultProjectConfig);
  const styles = ref<ProjectStyles>(DefaultProjectStyles);
  const media = ref<ProjectMedia>(DefaultProjectMedia);

  const parents = computed((): Map<string, string> => {
    const _parents = new Map();
    for (const [parentId, childObjects] of children.value.entries()) {
      for (const child of childObjects) {
        _parents.set(child.id, parentId);
      }
    }

    return _parents;
  });

  function importData(project: Project) {
    // Content Section
    objects.value = copyToMap(project.content.objects);
    children.value = copyToMap(project.content.children);
    scores.value = copyToMap(project.content.scores);

    config.value = project.config;
    styles.value = project.styles;
    media.value = project.media;
  }

  function exportData(): Project {
    return {
      content: {
        objects: copyToObject(objects.value),
        children: copyToObject(children.value),
        scores: copyToObject(scores.value),
      },
      config: clone(config.value),
      styles: clone(styles.value),
      media: clone(media.value),
    };
  }

  function clearData() {
    importData(DefaultProject);
  }

  function get<T extends ObjectType>(
    id: string,
    type: T,
  ): ObjectMap[T] | undefined {
    const object: AnyObject | undefined = objects.value.get(id);
    if (isNil(object)) {
      return undefined;
    } else if (object.type === type) {
      return object as ObjectMap[T];
    } else {
      return undefined;
    }
  }

  function getChildren(id: string): ChildObject[] {
    return children.value.get(id) ?? [];
  }
  function getParents(objectId: string): string[] {
    return reverse(
      unfold((childId: string) => {
        if (childId === '@root') return false;
        else {
          const parentId = parents.value.get(childId)!;
          return [childId, parentId];
        }
      }, objectId),
    );
  }

  return {
    // Reactive Data
    objects,
    children,
    parents,
    scores,
    config,
    styles,
    media,
    // Getters
    get,
    getChildren,
    getParents,
    // Utility Functions
    importData,
    exportData,
    clearData,
  };
});

export const useProjectStoreRefs = () => {
  return storeToRefs(useProjectStore());
};
