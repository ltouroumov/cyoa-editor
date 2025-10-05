<template>
  <Dialog
    v-model:visible="isSearchVisible"
    :modal="true"
    :dismissable-mask="true"
    :unstyled="true"
    pt:root:class="w-full md:w-2/3 p-4 h-full md:h-auto max-h-[100%]"
    pt:mask:class="backdrop-blur-sm"
  >
    <template #container>
      <div class="search-modal w-full h-full md:h-auto overflow-auto">
        <div class="search-header w-full">
          <InputGroup>
            <InputText
              ref="searchInput"
              v-model="searchText"
              placeholder="Search the CYOA"
              :fluid="true"
              :autofocus="true"
              @input="search"
            />
            <InputGroupAddon>
              <Button
                icon="iconify carbon--information"
                severity="secondary"
                @click="searchHelp.toggle($event)"
              />
            </InputGroupAddon>
          </InputGroup>
          <Popover ref="searchHelp">
            <div class="search-help">
              <div class="font-bold text-primary">Search Syntax</div>
              <ul>
                <li>
                  Exact value: <span class="code">"corona pollentia"</span>
                </li>
                <li>Only titles:<span class="code">title:taylor</span></li>
                <li>Only text:<span class="code">text:charges</span></li>
                <li>Requirement:<span class="code">required:skitter</span></li>
                <li>
                  Search exact cost/gain: <span class="code">cost:10SP</span>
                </li>
                <li>
                  Search cost/gain less or great than:
                  <span class="code">gain:"&lt;10 SP"</span>
                </li>
                <li>Search by ID: <span class="code">id:3ea234</span></li>
                <li>Alternatives: <span class="code">trump or tinker</span></li>
              </ul>
            </div>
          </Popover>
        </div>

        <div
          class="search-results w-full h-full"
          :class="{ 'show-view': !!searchView }"
        >
          <div class="panel results-list">
            <div class="h-full overflow-auto flex flex-col gap-2">
              <div
                v-if="isEmpty(searchResults)"
                class="flex flex-col gap-2 py-2 h-full md:max-h-[20rem] overflow-hidden relative"
              >
                <div
                  v-for="dummy in range(0, 20)"
                  :key="dummy"
                  class="result-item"
                >
                  <Skeleton shape="circle" size="1rem" animation="none" />
                  <div class="flex flex-col gap-1 w-full">
                    <div class="font-bold">
                      <Skeleton width="100%" height="1rem" animation="none" />
                    </div>
                    <div class="text-surface-500">
                      <Skeleton width="60%" height="1rem" animation="none" />
                    </div>
                  </div>
                </div>
                <div
                  class="absolute bottom-0 left-0 right-0 top-0 bg-surface-900/50 flex flex-row justify-center items-center"
                >
                  <div class="text-surface-500 text-center text-sm">
                    <span>no results ...</span>
                  </div>
                </div>
              </div>
              <template v-for="result in searchResults" :key="result.key">
                <div
                  v-if="result.type === 'object'"
                  class="result-item"
                  :class="{ selected: isSelected(result) }"
                  @click="select(result)"
                >
                  <div
                    class="iconify carbon--cube size-4 mt-1 text-primary-500"
                  ></div>
                  <div class="flex flex-col gap-1">
                    <div class="font-bold">{{ result.obj.title }}</div>
                    <div class="text-surface-500">{{ result.row.title }}</div>
                  </div>
                </div>
                <div
                  v-if="result.type === 'addon'"
                  class="result-item"
                  :class="{ selected: isSelected(result) }"
                  @click="select(result)"
                >
                  <div
                    class="iconify carbon--hexagon-vertical-outline size-4 mt-1 text-primary-500"
                  ></div>
                  <div class="flex flex-col gap-1">
                    <div class="flex flex-row gap-1 items-center">
                      <div class="font-bold">{{ result.addon.title }}</div>
                      <div class="text-surface-500 text-sm">
                        on {{ result.obj.title }}
                      </div>
                    </div>
                    <div class="text-surface-500">
                      {{ result.row.title }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div v-if="!!searchView" class="results-view">
            <ViewProjectObj
              v-if="searchView.type === 'object'"
              :obj="searchView.obj"
              :row="searchView.row"
              :view-object="ViewContext.Viewer"
              template="1"
              force-width="col-12"
              class="h-full"
              :allow-overflow="true"
              :show-addons="false"
              :display="{ showObjectControls: 'always' }"
            />
            <div
              v-if="searchView.type === 'addon'"
              class="h-full flex flex-col"
            >
              <div
                class="flex flex-row gap-1 items-center justify-center p-2 bg-surface-900 mb-1 border border-surface-700 rounded-xl"
                @click="showMore(searchView.obj)"
              >
                <div class="iconify carbon--zoom-in"></div>
                <span>Show Parent</span>
              </div>
              <div class="project-obj obj-default">
                <div class="project-obj-content">
                  <ViewAddon
                    :addon="searchView.addon"
                    :index="searchView.index"
                    :obj-id="searchView.obj.id"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { debounce } from 'perfect-debounce';
import { isEmpty, range } from 'ramda';

import type { ProjectObj } from '~/composables/project/types/v1';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';
import { ViewContext } from '~/composables/viewer';
import { type SearchResult, useSearch } from '~/composables/viewer/useSearch';

const { isSearchVisible } = useViewerRefs();
const { searchText, searchResults, updateResults } = useSearch();

const viewerStore = useViewerStore();

const searchView = ref<SearchResult | null>(null);

const searchHelp = ref<any>();
const searchInput = ref<HTMLInputElement>();
watch(isSearchVisible, (newValue) => {
  if (newValue === false) {
    searchText.value = '';
    searchResults.value = [];
    searchView.value = null;
  }
});

watch(searchText, (newValue) => {
  if (newValue === '') {
    searchView.value = null;
  }
});

const search = debounce(
  () => {
    updateResults();
  },
  500,
  {
    leading: false,
    trailing: true,
  },
);

const isSelected = (result: SearchResult) => {
  if (!searchView.value) return false;
  return (
    result.type === searchView.value.type && result.key === searchView.value.key
  );
};

const select = (result: SearchResult) => {
  if (!!searchView.value && isSelected(result)) {
    searchView.value = null;
  } else {
    searchView.value = result;
  }
};

const showMore = (obj: ProjectObj) => {
  viewerStore.showObjectDetails = { id: obj.id, tab: 'details' };
};
</script>

<style scoped lang="scss">
.modal-80 {
  width: 80%;
}

.search-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .search-header {
    justify-self: center;
    align-self: center;
  }

  .search-results {
    @apply flex flex-col md:flex-row items-stretch gap-2;

    margin-top: 0.5rem;
    overflow: auto;
  }

  .results-list {
    flex: 6 1 60%;

    overflow-y: auto;
    overflow-x: hidden;
  }

  .results-view {
    flex: 4 1 40%;

    overflow-y: auto;
    overflow-x: hidden;
  }
}

.panel {
  @apply bg-surface-900 rounded-xl border border-surface-700;
}

.result-item {
  @apply flex flex-row justify-start gap-1 px-2 py-1 cursor-pointer;

  &.selected {
    background: var(--p-surface-700);
  }
}

.search-help {
  font-size: 0.75rem;

  .code {
    font-family: monospace;
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
