<template>
  <div class="container" :class="{ compact: $props.compact ?? false }">
    <div class="toolbar" :class="{ compact: $props.compact ?? false }">
      <h1 class="title text-3xl">Interactive CYOA Viewer (NEO)</h1>
      <div v-if="librarySettings.show_load_file" class="load-container">
        <LoadProject :inline="true" />
      </div>
    </div>
    <main class="main-container">
      <div class="main-header">
        <InputText v-model="search" placeholder="Search ..." class="w-full" />
      </div>
      <div class="project-list-container">
        <div
          v-for="project in projects"
          :key="project.id"
          class="project-list-item"
          :class="{
            compact: $props.compact ?? false,
            cached: project.source === 'cached',
            local: project.source === 'local',
          }"
        >
          <div
            v-if="isNotNil(project.thumbnail_url)"
            class="thumbnail"
            @click.prevent="loadProject(project.id)"
          >
            <img :src="project.thumbnail_url" class="thumbnail-img" />
          </div>
          <div
            v-if="isNil(project.thumbnail_url)"
            class="thumbnail-ph"
            @click.prevent="loadProject(project.id)"
          >
            <span>No Thumbnail</span>
          </div>
          <div class="project-info" @click.prevent="loadProject(project.id)">
            <h2 class="project-title text-xl text-primary font-bold">
              {{ project.title }}
            </h2>
            <div
              v-if="project.source === 'local'"
              class="text-sm text-surface-600 italic mt-2"
            >
              Local Project
            </div>
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
          <div class="project-actions">
            <div
              v-if="project.source === 'remote'"
              class="flex flex-col items-center gap-1 grow"
            >
              <div class="grow"></div>
              <Button
                icon="iconify solar--download-broken"
                variant="outlined"
                @click.stop.prevent="openCacheDialog(project.id)"
              />
            </div>
            <div
              v-if="project.source === 'cached'"
              class="flex flex-col items-center gap-1 grow"
            >
              <div
                v-tooltip.bottom="
                  `Cached on ${isNotNil(project.cachedAt) ? format(project.cachedAt, 'yyyy-MM-dd') : 'unknown time'}`
                "
                class="iconify solar--archive-broken size-6 text-emerald-500"
              />
              <div class="grow"></div>
              <Button
                icon="iconify iconify solar--settings-linear"
                variant="outlined"
                @click.stop.prevent="openCacheDialog(project.id, true)"
              />
            </div>
            <div
              v-if="project.source === 'local'"
              class="flex flex-col items-center gap-1 grow"
            >
              <div
                v-tooltip.bottom="
                  `Cached on ${isNotNil(project.cachedAt) ? format(project.cachedAt, 'yyyy-MM-dd') : 'unknown time'}`
                "
                class="iconify solar--archive-broken size-6 text-emerald-500"
              />
              <div class="grow"></div>

              <Button
                icon="iconify iconify solar--settings-linear"
                variant="outlined"
                @click.stop.prevent="openCacheDialog(project.id, true)"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';
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

import { useViewerLibrary } from '~/composables/viewer/useViewerLibrary';

const $dialog = useDialog();

defineProps<{
  compact?: boolean;
}>();

const { projectList, librarySettings, loadProject } = useViewerLibrary();

const search = ref<string>('');

const projects = computed(() => {
  if (isEmpty(search.value)) return projectList.value;
  else {
    const searchStr = toLower(search.value);
    const terms = split(' ', searchStr);
    return projectList.value.filter((project) => {
      const title = toLower(project.title);
      return all(includes(__, title), terms);
    });
  }
});

const LazyCacheDialog = defineAsyncComponent(
  () => import('./menu/CacheDialog.vue'),
);
const openCacheDialog = async (id: string, update?: boolean) => {
  $dialog.open(LazyCacheDialog, {
    props: {
      header: update ? 'Manage Project Cache' : 'Download Project',
      modal: true,
      style: {
        width: '60vw',
      },
    },
    data: { projectId: id },
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

  &.cached {
    border-color: var(--p-indigo-500);
  }

  &.local {
    border-color: var(--p-cyan-500);
  }

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

  .project-actions {
    flex-grow: 0;
    padding: 0.75rem;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: start;
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
