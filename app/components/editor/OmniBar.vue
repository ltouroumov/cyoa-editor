<template>
  <Dialog
    v-model:visible="editorStore.showOmniBar"
    dismissable-mask
    pt:root:class="!border-0 !bg-transparent"
    pt:mask:class="bg-surface-900/60 backdrop-blur-sm"
  >
    <template #container="{}">
      <div class="flex flex-col gap-2 md:w-[40rem]">
        <InputGroup>
          <InputText
            ref="searchBar"
            v-model="searchRaw"
            autofocus="true"
            placeholder="Search in project ..."
          />
          <InputGroupAddon>
            <i class="iconify solar--magnifer-line-duotone"></i>
          </InputGroupAddon>
        </InputGroup>
        <div
          class="flex flex-col h-[20rem] overflow-y-auto bg-surface-800 rounded-md"
        >
          <div
            v-if="isEmpty(results.objects)"
            class="flex flex-row h-full justify-center items-center"
          >
            <div class="text-stone-500">Type to start searching ...</div>
          </div>
          <div v-if="isNotEmpty(results.objects)">
            <h2
              class="text-stone-500 font-bold px-4 py-2 border-b border-surface-700"
            >
              Objects
            </h2>
            <div
              v-for="(item, index) in results.objects"
              :key="index"
              class="px-4 py-2 flex flex-row group cursor-pointer items-center"
              :class="{
                'border-t border-surface-700': index !== 0,
              }"
              @click="showObject(item.objectId)"
            >
              <div class="grow group-hover:underline">{{ item.name }}</div>
              <div class="flex flex-row gap-1">
                <div class="text-surface-500 text-sm italic">
                  {{ item.type }}
                </div>
                <div class="text-surface-500 text-sm">{{ item.objectId }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { InputText } from 'primevue';
import { clone, includes, isEmpty, isNotEmpty, length, toLower } from 'ramda';

import { buildStackFromObjectId } from '~/components/editor/screens/useScreenDispatch';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import type { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const searchBar = ref();
const searchRaw = ref<string>('');
const search = debouncedRef(searchRaw, 200);

watch(
  [searchBar, () => editorStore.showOmniBar],
  ([searchBarV, showOmniBarV]) => {
    if (showOmniBarV && searchBarV) {
      searchRaw.value = '';
      searchBarV.$el.focus();
    }
  },
);

type SearchResults = {
  objectsCount: number;
  objects: { objectId: string; name: string; type: ObjectType }[];
  stylesCount: number;
  styles: { styleId: string; name: string }[];
  mediaCount: number;
  media: { mediaId: string; name: string }[];
};

const EmptySearchResults: SearchResults = {
  objects: [],
  objectsCount: 0,
  styles: [],
  stylesCount: 0,
  media: [],
  mediaCount: 0,
};

const results = computed((): SearchResults => {
  const _searchLC = toLower(search.value);
  if (isEmpty(_searchLC)) {
    return EmptySearchResults;
  }

  const _results: SearchResults = clone(EmptySearchResults);
  for (const object of projectStore.objects.values()) {
    if (
      includes(_searchLC, toLower(object.name)) ||
      includes(_searchLC, toLower(object.id))
    ) {
      _results.objects.push({
        objectId: object.id,
        name: object.name,
        type: object.type,
      });
    }
  }

  _results.objectsCount = length(_results.objects);
  return _results;
});

function showObject(objectId: string) {
  const stack = buildStackFromObjectId(objectId);

  editorStore.root = 'content';
  editorStore.stack = stack;
  editorStore.showOmniBar = false;
}
</script>

<style scoped lang="scss"></style>
