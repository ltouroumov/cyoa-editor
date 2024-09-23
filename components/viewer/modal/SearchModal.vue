<template>
  <ModalDialog :show="isSearchVisible" @close="toggleSearch(false)">
    <template #header>
      <h5 class="m-0">Search</h5>
    </template>
    <template #default>
      <div class="search-modal" :class="{ 'show-view': !!searchView }">
        <div class="search-header">
          <input
            ref="searchInput"
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
            :view-object="ViewContext.Viewer"
            template="1"
            force-width="col-12"
          />
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import { debounce } from 'perfect-debounce';
import { all, any, includes, isEmpty } from 'ramda';

import type { Project, ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';
import { ViewContext } from '~/composables/viewer';

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

const searchInput = ref<HTMLInputElement>();
watch(isSearchVisible, (newValue) => {
  if (newValue === false) {
    searchText.value = '';
    searchResults.value = [];
    searchView.value = null;
  } else {
    nextTick(() => {
      if (searchInput.value !== undefined) {
        searchInput.value.focus();
      }
    });
  }
});

watch(searchText, (newValue) => {
  if (newValue === '') {
    searchView.value = null;
  }
});

function createSearchFunction(searchText: string) {
  const searchTerms = searchText.toLowerCase().split(/\s+/);

  const matchesOne = (text: string): boolean => {
    const textLC = text.toLowerCase();
    return any((term) => includes(term, textLC), searchTerms);
  };

  const matchesAll = (text: string): boolean => {
    const textLC = text.toLowerCase();
    return all((term) => includes(term, textLC), searchTerms);
  };

  return (obj: ProjectObj): boolean => {
    const idMatch = matchesOne(obj.id);
    const titleMatch = matchesAll(obj.title);
    const textMatch = matchesAll(obj.text);

    const anyAddonMatch = any((addon) => {
      const titleMatch = matchesAll(addon.title);
      const textMatch = matchesAll(addon.text);
      return titleMatch || textMatch;
    }, obj.addons);

    return idMatch || titleMatch || textMatch || anyAddonMatch;
  };
}

const search = debounce(() => {
  if (!project.value) return;

  const searchTextLC = searchText.value.toLowerCase();
  const searchFn = createSearchFunction(searchText.value);

  const results: ResultGroup[] = [];

  if (isEmpty(searchTextLC)) {
    searchResults.value = [];
    return;
  }

  const data: Project = project.value.data;
  for (const row of data.rows) {
    const _results: ProjectObj[] = [];

    for (const obj of row.objects) {
      const objMatch = searchFn(obj);
      if (objMatch) {
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

.search-modal {
  flex: 1 1 auto;
  display: grid;
  gap: 0.5em;

  height: 100%;

  grid-template:
    'header header' auto
    'list list' 1fr
    / 1fr 1fr;

  &.show-view {
    grid-template:
      'header header' auto
      'list view' auto
      / 2fr 1fr;
  }

  @media screen and (max-width: 768px) {
    &.show-view {
      grid-template:
        'header' auto
        'list' 1fr
        'view' 1fr
        / 1fr;
    }
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
    display: flex;
    align-items: stretch;
    justify-content: stretch;
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

      &.selected {
        background: var(--bs-primary);
      }
    }
  }
}
</style>

<style lang="scss">
.search-modal .search-result-view {
  .project-obj {
    overflow-y: scroll;
  }
  .project-obj .project-obj-content {
    overflow: unset;
  }
}
</style>
