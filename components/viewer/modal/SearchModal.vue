<template>
  <Dialog
    v-model:visible="isSearchVisible"
    modal
    dismissable-mask
    class="w-full h-full mx-[2rem]"
    :dt="{ header: { padding: '1rem' }, content: { padding: '1rem' } }"
  >
    <template #header>
      <h5 class="text-primary text-xl">Search</h5>
    </template>
    <div class="search-modal" :class="{ 'show-view': !!searchView }">
      <div class="search-header">
        <InputText
          ref="searchInput"
          v-model="searchText"
          placeholder="Search CYOA"
          fluid
          autofocus
          @input="search"
        />
        <div class="search-help">
          Supports: <span class="code">"corona pollentia"</span>,
          <span class="code">title:taylor</span>,
          <span class="code">text:charges</span>,
          <span class="code">required:skitter</span>,
          <span class="code">cost:10SP</span>,
          <span class="code">gain:"&lt;10 SP"</span>,
          <span class="code">id:3ea234</span>, and
          <span class="code">trump or tinker</span>
        </div>
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
  </Dialog>
</template>

<script setup lang="ts">
import { debounce } from 'perfect-debounce';
import {
  all,
  any,
  chain,
  concat,
  filter,
  includes,
  isEmpty,
  isNil,
  isNotEmpty,
  isNotNil,
  length,
  map,
  prop,
  reject,
} from 'ramda';

import type {
  ConditionTerm,
  Project,
  ProjectObj,
  ProjectRow,
  Score,
} from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';
import { ViewContext } from '~/composables/viewer';

const { toggleSearch } = useViewerStore();
const { isSearchVisible } = useViewerRefs();
const { getObject, getPointType } = useProjectStore();
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
  }
});

watch(searchText, (newValue) => {
  if (newValue === '') {
    searchView.value = null;
  }
});

type SearchResult =
  | { or: SearchResult[] }
  | {
      args?: string[];
      kwargs?: Record<string, string[]>;
    };

const PART_MATCH = /(?:(?<key>\S+):)?(?:"(?<quoted>[^"]+)"|(?<word>\S+))/g;
const SCORE_MATCH = /^(?<operator><|>)?\s*(?<value>\d+)\s*(?<name>\w+)?$/;

function parseSearchTerm(parts: RegExpExecArray[]) {
  const result: SearchResult = {};
  for (const part of parts) {
    const partWords = part.groups?.quoted ?? part.groups?.word;
    if (isNil(partWords) || isEmpty(partWords)) continue;

    if (part.groups?.key) {
      const key = part.groups.key;
      if (!result.kwargs) {
        result.kwargs = {};
      }
      if (!result.kwargs[key]) {
        result.kwargs[key] = [];
      }

      result.kwargs[key].push(partWords);
    } else {
      if (!result.args) {
        result.args = [];
      }

      result.args.push(partWords);
    }
  }
  return result;
}

function parseSearch(input: string): SearchResult {
  const parts = input.matchAll(PART_MATCH);

  // Scan for the "or" keyword and split the input keywords into groups
  const orParts: RegExpExecArray[][] = [];
  let acc: RegExpExecArray[] = [];

  for (const part of parts) {
    if (part[0] === 'or') {
      orParts.push(acc);
      acc = [];
    } else {
      acc.push(part);
    }
  }
  orParts.push(acc);

  if (orParts.length > 1) {
    return { or: orParts.map(parseSearchTerm).filter(isNotEmpty) };
  } else {
    return parseSearchTerm(acc);
  }
}

type SearchFn = (obj: ProjectObj) => boolean;
type ScoreMatchFn = (score: Score) => boolean;

function createSearchFunction(searchText: string) {
  const searchTerms = searchText.toLowerCase().split(/\s+/);
  // If there are no search term, return
  if (length(searchTerms) === 0) return () => false;

  const searchExpr = parseSearch(searchText);

  const matchesOne = (args: string[], text: string): boolean => {
    const textLC = text.toLowerCase();
    return any((term) => includes(term, textLC), args);
  };

  const matchesAll = (args: string[], text: string): boolean => {
    const textLC = text.toLowerCase();
    return all((term) => includes(term, textLC), args);
  };

  const resolveReqNames = (ids: string[]): string[] => {
    const names = map((id) => getObject(id)?.title, ids);
    return reject(isNil, names);
  };

  const resolveReqIds = (reqs: ConditionTerm[]): string[] => {
    const resolveReq = (req: ConditionTerm): string[] => {
      if (req.showRequired) {
        return reject(
          isEmpty,
          concat(
            [req.reqId, req.reqId1, req.reqId2, req.reqId3],
            map(prop('req'), req.orRequired),
          ),
        );
      } else {
        return [];
      }
    };

    return chain(resolveReq, reqs);
  };

  const compileScoreMatcher = (
    inputs: string[],
    mode: 'cost' | 'gain',
  ): SearchFn => {
    const scoreMatch: ScoreMatchFn[] = map((search: string) => {
      const scoreMatch = SCORE_MATCH.exec(search);
      if (!scoreMatch) return null;

      const { operator, value, name } = scoreMatch.groups!;
      const valueInt = parseInt(value, 10);
      if (isNaN(valueInt)) return null;

      return (objScore: Score): boolean => {
        const pointType = getPointType(objScore.id);
        if (
          isNotNil(name) &&
          pointType.afterText.toLowerCase() !== name.toLowerCase()
        ) {
          return false;
        }
        const rawScoreValue = parseInt(objScore.value);

        if (isNaN(rawScoreValue)) return false;
        else if (mode === 'cost' && rawScoreValue < 0) return false;
        else if (mode === 'gain' && rawScoreValue > 0) return false;

        const scoreValue = mode === 'gain' ? -rawScoreValue : rawScoreValue;
        if (operator === '>') {
          return scoreValue >= valueInt;
        }
        if (operator === '<') {
          return scoreValue <= valueInt;
        }
        return scoreValue === valueInt;
      };
    }, inputs).filter(isNotNil);

    return (obj: ProjectObj) => {
      return any(
        (objScore: Score) => any((mat) => mat(objScore), scoreMatch),
        filter((score) => isEmpty(score.requireds), obj.scores),
      );
    };
  };

  function compileSearchExpr(expr: SearchResult): SearchFn {
    if ('or' in expr) {
      const subExpr = expr.or.map((expr: SearchResult) =>
        compileSearchExpr(expr),
      );
      return (obj) => any((subExpr) => subExpr(obj), subExpr);
    } else {
      const args = expr.args ?? [];
      const kwargs = expr.kwargs ?? {};

      const searchFns: SearchFn[] = [];

      if (length(args) > 0) {
        searchFns.push((obj) => {
          return (
            matchesAll(args, obj.title) ||
            matchesAll(args, obj.text) ||
            any(
              (addon) =>
                matchesAll(args, addon.title) || matchesAll(args, addon.text),
              obj.addons,
            )
          );
        });
      }
      if ('id' in kwargs) {
        searchFns.push((obj) => matchesOne(kwargs.id, obj.id));
      }
      if ('title' in kwargs) {
        searchFns.push((obj) => matchesAll(kwargs.title, obj.title));
      }
      if ('text' in kwargs) {
        searchFns.push((obj) => matchesAll(kwargs.text, obj.text));
      }
      if ('required' in kwargs) {
        searchFns.push((obj) => {
          const reqIds: string[] = resolveReqIds(obj.requireds);
          const reqNames = resolveReqNames(reqIds);
          return (
            any((req) => matchesAll(kwargs.required, req), reqNames) ||
            any((req) => matchesOne(kwargs.required, req), reqIds) ||
            any((addon) => {
              const reqIds: string[] = resolveReqIds(addon.requireds);
              const reqNames = resolveReqNames(reqIds);
              return (
                any((req) => matchesAll(kwargs.required, req), reqNames) ||
                any((req) => matchesOne(kwargs.required, req), reqIds)
              );
            }, obj.addons)
          );
        });
      }
      if ('cost' in kwargs) {
        searchFns.push(compileScoreMatcher(kwargs.cost, 'cost'));
      }
      if ('gain' in kwargs) {
        searchFns.push(compileScoreMatcher(kwargs.gain, 'gain'));
      }

      return (obj) => all((searchFn) => searchFn(obj), searchFns);
    }
  }

  return compileSearchExpr(searchExpr);
}

const search = debounce(
  () => {
    if (!project.value) return;

    const searchTextLC = searchText.value.trim().toLowerCase();
    if (isEmpty(searchTextLC)) {
      searchResults.value = [];
      return;
    }

    const searchFn = createSearchFunction(searchTextLC);
    const results: ResultGroup[] = [];

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
  },
  500,
  { leading: false, trailing: true },
);

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
      'list view' 1fr
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

    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .search-help {
      color: var(--bs-secondary);
      font-size: 0.75rem;

      .code {
        font-family: monospace;
      }
    }
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
