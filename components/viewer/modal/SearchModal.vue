<template>
  <Dialog
    v-model:visible="isSearchVisible"
    :modal="true"
    :dismissable-mask="true"
    :unstyled="true"
    pt:root:class="w-full md:w-2/3"
    pt:mask:class="backdrop-blur-sm overflow-auto"
  >
    <template #container>
      <div class="search-modal w-full h-full border border-white overflow-auto">
        <div class="search-header w-full">
          <InputGroup>
            <InputText
              ref="searchInput"
              v-model="searchText"
              placeholder="Search CYOA"
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
          class="search-results w-full h-[3000px]"
          :class="{ 'show-view': !!searchView }"
        >
          <div class="panel results-list flex-grow-2">
            <template v-for="result in searchResults" :key="result.key">
              <div
                v-if="result.type === 'object'"
                class="flex flex-row justify-start gap-1"
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
                class="flex flex-row justify-start gap-1"
              >
                <div
                  class="iconify carbon--hexagon-vertical-outline size-4 mt-1 text-primary-500"
                ></div>
                <div class="flex flex-col gap-1">
                  <div class="font-bold">{{ result.addon.title }}</div>
                  <div class="text-surface-500">
                    {{ result.obj.title }} / {{ result.row.title }}
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-if="!!searchView" class="panel results-view flex-grow-1">
            <ViewProjectObj
              :key="searchView.obj.id"
              :obj="searchView.obj"
              :row="searchView.row"
              :view-object="ViewContext.Viewer"
              template="1"
              force-width="col-12"
              :allow-overflow="true"
              :show-addons="true"
            />
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { debounce } from 'perfect-debounce';

import type { ProjectObj, ProjectRow } from '~/composables/project/types/v1';
import { useViewerRefs } from '~/composables/store/viewer';
import { ViewContext } from '~/composables/viewer';
import { useSearch } from '~/composables/viewer/useSearch';

const { isSearchVisible } = useViewerRefs();
const { searchText, searchResults, updateResults } = useSearch();

type ResultView = {
  row: ProjectRow;
  obj: ProjectObj;
};

const searchView = ref<ResultView | null>(null);

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

const search = debounce(() => updateResults(), 500, {
  leading: false,
  trailing: true,
});

const preview = (obj: ProjectObj, row: ProjectRow) => {
  if (!!searchView.value && searchView.value.obj.id === obj.id) {
    searchView.value = null;
  } else {
    searchView.value = { obj, row };
  }
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
    display: flex;
    flex-direction: row;
    align-items: stretch;

    margin-top: 1rem;
  }

  .search-result-view {
    grid-area: view;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    overflow: auto;
  }
}

.panel {
  @apply bg-surface-900 rounded-xl border border-surface-700 p-2;
}

.result-item {
  padding: 0.2rem 0.5rem;

  &.selected {
    background: var(--p-primary-500);
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
