<template>
  <div class="search-base" :class="{ hidden: !isSearchVisible }">
    <div class="search-modal" :class="{ 'show-view': !!searchView }">
      <div class="search-header">
        <input
          v-model="searchText"
          class="form-control"
          placeholder="Search CYOA"
          @input="search"
        />
      </div>
      <div class="search-result-list text-light">
        <div
          v-for="group in searchResults"
          :key="group.row.id"
          class="result-group"
        >
          <div class="group-title">{{ group.row.title }}</div>
          <div
            v-for="obj in group.items"
            :key="obj.id"
            class="result-item"
            :class="{ selected: searchView?.obj.id === obj.id }"
            @click="preview(obj, group.row)"
          >
            {{ obj.title }}
          </div>
        </div>
      </div>
      <div v-if="!!searchView" class="search-result-view text-light">
        <ViewProjectObj
          :key="searchView.obj.id"
          :obj="searchView.obj"
          :row="searchView.row"
          preview
        />
      </div>
    </div>
    <div class="search-shade" @click="toggleSearch(false)"></div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'perfect-debounce';
import { isEmpty } from 'ramda';

import { Project, ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { toggleSearch } = useViewerStore();
const { isSearchVisible } = useViewerRefs();
const { project } = useProjectRefs();

type ResultGroup = {
  row: ProjectRow;
  items: ProjectObj[];
};
type ResultView = {
  row: ProjectRow;
  obj: ProjectObj;
};

const searchText = ref<string>('');
const searchResults = ref<ResultGroup[]>([]);
const searchView = ref<ResultView | null>(null);

const search = debounce(() => {
  if (!project.value) return;

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

const preview = (obj: ProjectObj, row: ProjectRow) => {
  if (!!searchView.value && searchView.value.obj.id === obj.id) {
    searchView.value = null;
  } else {
    searchView.value = { obj, row };
  }
};
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

.search-base {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  &.hidden {
    display: none;
  }
}

.search-shade {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;

  background: rgba(50, 50, 50, 0.5);
}

.search-modal {
  min-width: 200px;
  min-height: 200px;
  width: 80%;
  height: 80%;

  padding: 0.75em;
  border-radius: 1em;
  background: $body-bg-dark;

  display: grid;
  gap: 0.5em;

  grid-template:
    'header header' auto
    'list list' 1fr
    / 1fr 1fr;

  &.show-view {
    grid-template:
      'header header' auto
      'list view' 1fr
      / 2fr 1fr;
  }

  .search-header {
    grid-area: header;
  }

  .search-result-list {
    grid-area: list;
    overflow: auto;
  }

  .search-result-view {
    grid-area: view;
    overflow: auto;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  .result-group {
    .group-title {
      font-weight: bold;
      border-bottom: var(--bs-border-width) solid var(--bs-border-color);
      padding: 0.2rem 0.5rem;
    }
    .result-item {
      padding: 0.2rem 0.5rem;

      &.selected {
        background: var(--bs-primary);
      }
    }
  }
}
</style>
