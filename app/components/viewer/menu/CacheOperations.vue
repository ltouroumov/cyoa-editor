<template>
  <div v-if="isNotEmpty(cacheOperations)" class="flex flex-col gap-2 py-1">
    <div class="text-primary">Cache Operations</div>
    <div
      v-for="operation in cacheOperations"
      :key="operation.taskId"
      class="flex flex-col gap-2"
    >
      <div
        v-if="operation.status === 'running'"
        class="flex flex-row items-center gap-1 w-full"
      >
        <ProgressSpinner class="size-4" />
        <div class="grow w-full">
          {{ operation.progress ?? 'Running ...' }}
        </div>
        <Button
          size="small"
          icon="pi pi-times"
          variant="text"
          @click="$emit('abort', operation.taskId)"
        />
      </div>
      <div
        v-if="operation.status === 'completed'"
        class="flex flex-row items-center"
      >
        <div class="grow w-full">Cache operation completed.</div>
        <Button
          size="small"
          icon="pi pi-times"
          variant="text"
          @click="$emit('clear', operation.taskId)"
        />
      </div>
      <div
        v-if="operation.status === 'cancelled'"
        class="flex flex-row items-center"
      >
        <div class="grow w-full">Cache operation cancelled.</div>
        <Button
          size="small"
          icon="pi pi-times"
          variant="text"
          @click="$emit('clear', operation.taskId)"
        />
      </div>
      <div
        v-if="operation.status === 'failure'"
        class="flex flex-row items-center"
      >
        <div class="grow w-full">Cache operation failed.</div>
        <Button
          size="small"
          icon="pi pi-times"
          variant="text"
          @click="$emit('clear', operation.taskId)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNotEmpty } from 'ramda';

import type { CacheOperation } from '~/composables/viewer/useViewerLibrary';

defineProps<{
  cacheOperations: CacheOperation[];
}>();

defineEmits<{
  (e: 'clear' | 'abort', taskId: string): void;
}>();
</script>

<style scoped lang="scss"></style>
