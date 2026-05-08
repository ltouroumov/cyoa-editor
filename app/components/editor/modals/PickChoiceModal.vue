<template>
  <div class="flex flex-col gap-2 min-w-[30vw]">
    <InputText v-model="search" class="w-full" />
    <div
      class="flex flex-col bg-surface-900 border border-surface-700 rounded overflow-y-auto"
    >
      <div
        v-for="(result, idx) in results.choices"
        :key="result.id"
        class="p-2 cursor-pointer"
        :class="{ 'bg-surface-800': idx % 2 === 0 }"
        @click="close(result.id)"
      >
        {{ result.name }}
      </div>
      <div
        v-if="isEmpty(results.choices)"
        class="min-h-40 flex flex-col items-center justify-center"
      >
        <div class="text-muted-color">No Results</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from 'ramda';

import { useModalClient } from '~/components/editor/utils/useModalClient';
import { useChoiceSearch } from '~/composables/editor/useChoiceSearch';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $project = useProjectStore();

const { close } = useModalClient();

const { search, results } = useChoiceSearch();
</script>

<style scoped lang="scss"></style>
