<template>
  <div class="search-base" :class="{ hidden: !isSearchVisible }">
    <div class="search-modal">
      <div class="search-header">
        <input
          v-model="searchText"
          class="form-control"
          placeholder="Search CYOA"
          @input="search"
        />
      </div>
      <div class="search-results text-light">
        <div
          v-for="group in searchResults"
          :key="group.row.id"
          class="result-group"
        >
          <div class="group-title">{{ group.row.title }}</div>
          <div v-for="obj in group.items" :key="obj.id" class="result-item">
            {{ obj.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'perfect-debounce';
import { isEmpty } from 'ramda';

import { Project, ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs } from '~/composables/store/viewer';

const { isSearchVisible } = useViewerRefs();
const { project } = useProjectRefs();

type ResultGroup = {
  row: ProjectRow;
  items: ProjectObj[];
};

const searchText = ref<string>('');
const searchResults = ref<ResultGroup[]>([]);
const search = debounce(() => {
  if (!project.value) return;

  console.log('searching', searchText.value);

  const searchTextLC = searchText.value.toLowerCase();
  const results: ResultGroup[] = [];

  if (isEmpty(searchTextLC)) {
    searchResults.value = [];
    return;
  }

  const data: Project = project.value.data;
  for (const row of data.rows) {
    const _results: ProjectObj[] = [];

    for (const obj of row.objects) {
      const titleLC = obj.title.toLowerCase();
      if (titleLC.includes(searchTextLC)) {
        _results.push(obj);
      }
    }

    if (!isEmpty(_results)) {
      results.push({
        row,
        items: _results,
      });
    }
  }

  searchResults.value = results;
}, 200);
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

.search-base {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;

  background: rgba(50, 50, 50, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  &.hidden {
    display: none;
  }
}

.search-modal {
  min-width: 200px;
  min-height: 200px;
  width: 50%;
  height: 70%;

  padding: 0.75em;
  border-radius: 1em;
  background: $body-bg-dark;

  display: flex;
  flex-direction: column;
  gap: 0.5em;

  .search-results {
    flex-grow: 1;
    border: var(--bs-border-width) solid var(--bs-border-color);
    border-radius: var(--bs-border-radius);

    overflow: auto;
  }

  .result-group {
    .group-title {
      font-weight: bold;
      border-bottom: var(--bs-border-width) solid var(--bs-border-color);
      padding: 0.2rem 0.5rem;
    }
    .result-item {
      padding: 0.2rem 0.5rem;
    }
  }
}
</style>
