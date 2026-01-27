import {
  all,
  any,
  chain,
  concat,
  includes,
  isEmpty,
  isNil,
  isNotEmpty,
  isNotNil,
  length,
  map,
  partition,
  prop,
  reject,
  slice,
  startsWith,
} from 'ramda';
import * as R from 'ramda';
import { match } from 'ts-pattern';
import { type ComputedRef, computed, ref } from 'vue';

import type {
  ConditionTerm,
  ObjAddon,
  PointType,
  Project,
  ProjectObj,
  ProjectRow,
  Score,
} from '~/composables/project/types/v1';
import type {
  SearchEvent,
  WorkerSearchResult,
} from '~/composables/viewer/search/types';
import { sanitizeString } from '~/composables/viewer/search/norm';

const project = ref<Project | null>(null);

const getObject: ComputedRef<(id: string) => ProjectObj> = computed(() => {
  const objects: Record<string, ProjectObj> = R.indexBy(
    R.prop('id'),
    R.chain(R.prop('objects'), project.value?.rows ?? []),
  );

  return (id: string) => objects[id];
});

const getPointType: ComputedRef<(id: string) => PointType> = computed(() => {
  const pointTypes: Record<string, PointType> = R.indexBy(
    R.prop('id'),
    project.value?.pointTypes ?? [],
  );

  return (id: string) => pointTypes[id];
});

self.addEventListener(
  'message',
  (e: MessageEvent<{ event: string; replyTo?: string }>) => {
    const { event, replyTo = null } = e.data;
    try {
      const payload = JSON.parse(event) as SearchEvent;
      match(payload)
        .with({ type: 'init' }, ({ project: p }) => {
          project.value = p;
        })
        .with({ type: 'search' }, ({ query }) => {
          if (!project.value) {
            postMessage({
              replyTo: replyTo,
              message: JSON.stringify({
                results: [],
              }),
            });
          } else {
            const results = doSearch(query);
            const count = results.length;
            postMessage({
              replyTo: replyTo,
              message: JSON.stringify({
                count: count,
                results: slice(0, Math.min(MAX_RESULTS, count), results),
              }),
            });
          }
        })
        .exhaustive();
    } catch (e) {
      console.log('error in search worker', e);
    }
  },
);

function normalizeSearchQuery(query: string) {
  return sanitizeString(query.trim().toLowerCase().normalize('NFD'));
}

function doSearch(query: string) {
  const searchTextLC = normalizeSearchQuery(query);
  if (isEmpty(searchTextLC)) {
    return [];
  }

  const searchFn = createSearchFunction(searchTextLC);
  const results: WorkerSearchResult[] = [];

  for (const row of project.value!.rows) {
    for (const obj of row.objects) {
      const objMatch = searchFn({ type: 'object', data: obj, parentRow: row });
      if (objMatch) {
        results.push({
          type: 'object',
          rowId: row.id,
          objId: obj.id,
        });
      }

      for (let idx = 0; idx < obj.addons.length; idx++) {
        const addon = obj.addons[idx];
        const addonMatch = searchFn({
          type: 'addon',
          data: addon,
          parentObj: obj,
          parentRow: row,
        });
        if (addonMatch) {
          results.push({
            type: 'addon',
            rowId: row.id,
            objId: obj.id,
            addonId: addon.id || idx,
          });
        }
      }
    }
  }

  return results;
}

function parseSearchTerm(parts: RegExpExecArray[]): SearchTerm {
  const terms: SearchTerm = {};
  for (const part of parts) {
    const partWords = part.groups?.quoted ?? part.groups?.word;
    if (isNil(partWords) || isEmpty(partWords)) continue;

    if (part.groups?.key) {
      const key = part.groups.key;
      if (!terms.kwargs) {
        terms.kwargs = {};
      }
      if (!terms.kwargs[key]) {
        terms.kwargs[key] = [];
      }

      terms.kwargs[key].push(partWords);
    } else {
      if (!terms.args) {
        terms.args = [];
      }

      terms.args.push(partWords);
    }
  }
  return terms;
}

function parseSearch(input: string): SearchTerm {
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

type SearchFn = (
  entry:
    | { type: 'object'; data: ProjectObj; parentRow: ProjectRow }
    | {
        type: 'addon';
        data: ObjAddon;
        parentObj: ProjectObj;
        parentRow: ProjectRow;
      },
) => boolean;
type ScoreMatchFn = (score: Score) => boolean;

type ScoreMatch = {
  relative: boolean;
  exec: ScoreMatchFn;
};

function createSearchFunction(searchText: string) {
  const searchTerms = searchText.toLowerCase().split(/\s+/);
  // If there are no search term, return
  if (length(searchTerms) === 0) return () => false;

  const searchExpr = parseSearch(searchText);

  const matchTerm = (term: string, text: string): boolean => {
    if (startsWith('~', term)) return !includes(term.slice(1), text);
    else return includes(term, text);
  };

  const matchesOne = (args: string[], text: string): boolean => {
    const textLC = text.toLowerCase();
    return any((term) => matchTerm(term, textLC), args);
  };

  const matchesAll = (args: string[], text: string): boolean => {
    const textLC = text.toLowerCase();
    return all((term) => matchTerm(term, textLC), args);
  };

  const resolveReqNames = (ids: string[]): string[] => {
    const names = map((id) => getObject.value(id)?.title, ids);
    return reject(isNil, names);
  };

  const resolveReqIds = (reqs: ConditionTerm[]): string[] => {
    const resolveReq = (req: ConditionTerm): string[] => {
      return reject(
        isEmpty,
        concat(
          [req.reqId, req.reqId1, req.reqId2, req.reqId3],
          map(prop('req'), req.orRequired),
        ),
      );
    };

    return chain(resolveReq, reqs);
  };

  const compileMatcher = (matcher: {
    onObject?: (data: ProjectObj, parent: ProjectRow) => boolean;
    onAddon?: (
      data: ObjAddon,
      parentObj: ProjectObj,
      parentRow: ProjectRow,
    ) => boolean;
    onBoth?: (
      data: ProjectObj | ObjAddon,
      parentRow: ProjectRow,
      parentObj?: ProjectObj,
    ) => boolean;
  }): SearchFn => {
    return (entry) => {
      if (entry.type === 'object' && matcher.onObject) {
        return matcher.onObject(entry.data, entry.parentRow);
      } else if (entry.type === 'addon' && matcher.onAddon) {
        return matcher.onAddon(entry.data, entry.parentObj, entry.parentRow);
      } else if (matcher.onBoth) {
        return matcher.onBoth(
          entry.data,
          entry.parentRow,
          'parentObj' in entry ? entry.parentObj : undefined,
        );
      } else {
        return false;
      }
    };
  };

  const compileScoreMatcher = (
    inputs: string[],
    mode: 'cost' | 'gain',
  ): SearchFn => {
    const scoreMatch: ScoreMatch[] = map(
      (search: string): ScoreMatch | null => {
        const scoreMatch = SCORE_MATCH.exec(search);
        if (!scoreMatch) return null;

        const { operator, value, name } = scoreMatch.groups!;
        const valueInt = parseInt(value, 10);
        if (isNaN(valueInt)) return null;

        return {
          relative: operator === '>' || operator === '<',
          exec: (objScore: Score): boolean => {
            const pointType = getPointType.value(objScore.id);
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
            } else if (operator === '<') {
              return scoreValue <= valueInt;
            } else {
              return scoreValue === valueInt;
            }
          },
        };
      },
      inputs,
    ).filter(isNotNil);

    const [relativeMatch, absoluteMatch] = partition(
      prop('relative'),
      scoreMatch,
    );
    return compileMatcher({
      onObject: (obj: ProjectObj) => {
        return any(
          (objScore: Score) =>
            (isNotEmpty(relativeMatch) &&
              all((mat) => mat.exec(objScore), relativeMatch)) ||
            (isNotEmpty(absoluteMatch) &&
              any((mat) => mat.exec(objScore), absoluteMatch)),
          obj.scores,
        );
      },
    });
  };

  function compileSearchExpr(expr: SearchTerm): SearchFn {
    if ('or' in expr) {
      const subExpr = expr.or.map((expr: SearchTerm) =>
        compileSearchExpr(expr),
      );
      return (obj) => any((subExpr) => subExpr(obj), subExpr);
    } else {
      const args = expr.args ?? [];
      const kwargs = expr.kwargs ?? {};

      const searchFns: SearchFn[] = [];

      if (length(args) > 0) {
        searchFns.push(
          compileMatcher({
            onBoth: (data) =>
              matchesAll(args, data.title) || matchesAll(args, data.text),
          }),
        );
      }
      if ('id' in kwargs) {
        searchFns.push(
          compileMatcher({
            onBoth: (obj) => isNotNil(obj.id) && matchesOne(kwargs.id, obj.id),
          }),
        );
      }
      if ('title' in kwargs) {
        searchFns.push(
          compileMatcher({
            onBoth: (obj) => matchesAll(kwargs.title, obj.title),
          }),
        );
      }
      if ('text' in kwargs) {
        searchFns.push(
          compileMatcher({
            onBoth: (obj) => matchesAll(kwargs.text, obj.text),
          }),
        );
      }
      if ('parent' in kwargs) {
        searchFns.push(
          compileMatcher({
            onBoth: (_obj, parentRow, parentObj) =>
              matchesAll(kwargs.parent, parentRow.title) ||
              (parentObj ? matchesAll(kwargs.parent, parentObj.title) : false),
          }),
        );
      }
      if ('row' in kwargs) {
        searchFns.push(
          compileMatcher({
            onBoth: (_obj, parentRow) =>
              matchesAll(kwargs.row, parentRow.title),
          }),
        );
      }
      if ('required' in kwargs) {
        searchFns.push(
          compileMatcher({
            onBoth: (obj) => {
              const reqIds: string[] = resolveReqIds(obj.requireds);
              const reqNames = resolveReqNames(reqIds);
              return (
                any((req) => matchesAll(kwargs.required, req), reqNames) ||
                any((req) => matchesOne(kwargs.required, req), reqIds)
              );
            },
          }),
        );
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

type SearchTerm =
  | { or: SearchTerm[] }
  | {
      args?: string[];
      kwargs?: Record<string, string[]>;
    };

const MAX_RESULTS = 500;
const PART_MATCH = /(?:(?<key>\S+):)?(?:"(?<quoted>[^"]+)"|(?<word>\S+))/g;
const SCORE_MATCH = /^(?<operator>[<>])?\s*(?<value>\d+)\s*(?<name>\w+)?$/;
