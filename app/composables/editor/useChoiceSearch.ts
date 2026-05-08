import { includes, isEmpty, toLower } from 'ramda';

import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

type SearchResults = { choices: ChoiceObject[]; count: number };

export function useChoiceSearch() {
  const projectStore = useProjectStore();

  const searchRaw = ref<string>('');
  const searchText = debouncedRef(searchRaw, 200);

  const results = computed((): SearchResults => {
    const _searchLC = toLower(searchText.value);
    if (isEmpty(_searchLC)) {
      return { choices: [], count: 0 };
    }

    const _results: ChoiceObject[] = [];
    let _count: number = 0;
    for (const object of projectStore.objects.values()) {
      if (
        object.type === ObjectType.choice &&
        (includes(_searchLC, toLower(object.name)) ||
          includes(_searchLC, toLower(object.id)))
      ) {
        _count++;
        if (_results.length < 50) {
          _results.push(object);
        }
      }
    }

    return { choices: _results, count: _count };
  });

  return { search: searchRaw, results };
}
