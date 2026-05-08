<template>
  <div class="flex flex-col gap-2">
    <InputText v-model="search" class="w-full" />
    <div class="flex flex-col gap-2">
      <div
        v-for="result in results.choices"
        :key="result.id"
        @click="close(result.id)"
      >
        {{ result.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModalClient } from '~/components/editor/utils/useModalClient';
import { useChoiceSearch } from '~/composables/editor/useChoiceSearch';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $project = useProjectStore();

const { close } = useModalClient();

const { search, results } = useChoiceSearch();
</script>

<style scoped lang="scss"></style>
