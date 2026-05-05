<template>
  <div class="flex flex-row gap-1">
    <div class="flex flex-col items-center">
      <!--      <div class="border-b border-surface-600 my-2 w-1/2"></div>-->
      <!--      <div class="border-s border-surface-600 flex-1"></div>-->
      <div class="bg-surface-800 px-2 py-1 rounded mb-2">OR</div>
      <div class="border-s border-surface-600 flex-1"></div>
      <div class="border-b border-surface-600 my-2 w-1/2"></div>
    </div>
    <div class="flex flex-col gap-1">
      <EditConditionTerm
        v-for="(child, idx) in term.anyOf"
        :key="idx"
        :term="child"
        :depth="depth + 1"
      />

      <div class="flex flex-row items-center justify-start">
        <div
          class="bg-surface-800 px-2 py-1 rounded text-muted-color text-sm flex flex-row items-center gap-1"
        >
          <span class="iconify solar--add-circle-line-duotone"></span> OR
        </div>
        <div
          class="flex-1 border-t border-dashed border-surface-600 ms-2"
        ></div>
        <IconButton
          icon="iconify solar--trash-bin-trash-line-duotone"
          size="small"
          variant="text"
          severity="secondary"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnyOfCondition } from '~/composables/project/types/v2/condition';

const $props = defineProps<{
  term: AnyOfCondition;
  depth: number;
}>();
</script>

<style scoped lang="scss"></style>
