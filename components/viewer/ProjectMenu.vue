<template>
  <div class="container" :class="{ compact: $props.compact ?? false }">
    <div class="toolbar" :class="{ compact: $props.compact ?? false }">
      <h1 class="title text-3xl">Interactive CYOA Viewer (NEO)</h1>
      <div v-if="projectList.show_load_file" class="load-container">
        <LoadProject :inline="true" />
      </div>
    </div>
    <main class="main-container">
      <div class="main-header">
        <InputText v-model="search" placeholder="Search ..." />
      </div>
      <div class="project-list-container">
        <div
          v-for="project in projects"
          :key="project.id"
          class="project-list-item"
          :class="{ compact: $props.compact ?? false }"
          @click.prevent="loadRemoteFile(project)"
        >
          <div v-if="isNotNil(project.thumbnail_url)" class="thumbnail">
            <img :src="project.thumbnail_url" class="thumbnail-img" />
          </div>
          <div v-if="isNil(project.thumbnail_url)" class="thumbnail-ph">
            <span>No Thumbnail</span>
          </div>
          <div class="project-info">
            <h2 class="project-title text-xl text-primary font-bold">
              {{ project.title }}
            </h2>
            <div
              v-if="isNotNil(project.description)"
              class="project-description"
            >
              {{ project.description }}
            </div>
            <div v-if="isNotNil(project.author)" class="project-author">
              By {{ project.author }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  __,
  all,
  includes,
  isEmpty,
  isNil,
  isNotNil,
  split,
  toLower,
} from 'ramda';

import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { bufferToString } from '~/composables/utils';
import { sleep } from '~/composables/utils/sleep';
import type { ViewerProjectList } from '~/composables/viewer';

const { projectList } = defineProps<{
  projectList: ViewerProjectList;
  compact?: boolean;
}>();

const { loadProject } = useProjectStore();
const { toggleProjectMenu } = useViewerStore();

const search = ref<string>('');

const projects = computed(() => {
  if (isEmpty(search.value)) return projectList.items;
  else {
    const searchStr = toLower(search.value);
    const terms = split(' ', searchStr);
    return projectList.items.filter((project) => {
      const title = toLower(project.title);
      return all(includes(__, title), terms);
    });
  }
});

const loadRemoteFile = async (project: ViewerProject) => {
  const fileURL = project.file_url;
  if (!fileURL) return;

  toggleProjectMenu(false);
  await loadProject(async (setProgress) => {
    const response = await fetch(fileURL);
    if (response.ok) {
      const reader = response.body!.getReader();

      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        received += value.length;

        const receivedMB = received / (1024 * 1024);
        const neat = Math.round(receivedMB * 100) / 100;
        await setProgress(`Downloaded ${neat} Mb`);
      }

      await setProgress(`Loading ${project.title} ...`);
      // A hack, but otherwise the progress value never updates before loadProject is called
      await sleep(100);

      const bodyBytes = new Uint8Array(received);
      let pos = 0;
      for (const chunk of chunks) {
        bodyBytes.set(chunk, pos);
        pos += chunk.length;
      }

      return {
        fileContents: bufferToString(bodyBytes.buffer),
        fileName: fileURL.toString(),
      };
    } else {
      throw new Error(
        `HTTP Request failed with ${response.status}: ${response.statusText}`,
      );
    }
  });
};
</script>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.container.compact {
  padding: 0;
}

.main-header {
  margin-bottom: 1rem;
}

.project-list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-list-item {
  border: 1px solid var(--p-content-border-color);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: row;
  overflow: clip;
  align-items: center;
  cursor: pointer;

  .thumbnail {
    flex-grow: 0;
    height: 200px;
    width: 300px;
    display: flex;
    align-items: center;
    justify-content: center;

    .thumbnail-img {
      width: 100%;
      aspect-ratio: 3/2;
      object-fit: cover;
    }
  }

  .thumbnail-ph {
    flex-grow: 0;
    width: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;

    background: repeating-linear-gradient(
      45deg,
      var(--p-gray-800),
      var(--p-gray-800) 10px,
      var(--p-gray-700) 10px,
      var(--p-gray-700) 20px
    );

    span {
      color: var(--p-gray-600);
    }
  }

  .project-info {
    flex-grow: 1;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--p-content-border-color);
    align-self: stretch;
  }

  .project-title-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .project-title {
    text-decoration: underline;
  }
  .project-description {
    flex-grow: 1;
  }
  .project-author {
    font-size: 0.8rem;
    color: var(--p-stone-600);
    font-style: italic;
  }

  &.compact {
    flex-direction: row-reverse;

    .thumbnail,
    .thumbnail-ph {
      width: 120px;
      height: 80px;
    }
    .project-info {
      border-left: none;
      border-right: 1px solid var(--p-content-border-color);
    }
  }
}

.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--p-content-border-color);

  .title {
    color: var(--p-primary-500);
  }

  &.compact {
    .title {
      display: none;
    }
    .load-container {
      flex-grow: 1;
    }
  }
}
</style>
