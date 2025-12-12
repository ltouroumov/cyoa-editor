<template>
  <div
    v-if="isNotEmpty(cacheOperations)"
    class="flex flex-col border border-surface-600 rounded-xl overflow-hidden"
  >
    <div
      v-for="operation in cacheOperations"
      :key="operation.taskId"
      class="border-b border-surface-600 last:border-b-0 hover:bg-surface-800"
    >
      <div
        v-if="operation.status === 'running'"
        class="flex flex-row items-center gap-1 w-full px-2"
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
        class="flex flex-row items-center px-2"
      >
        <div class="grow w-full">{{ operation.name }} completed.</div>
        <Button
          size="small"
          icon="pi pi-times"
          variant="text"
          @click="$emit('clear', operation.taskId)"
        />
      </div>
      <div
        v-if="operation.status === 'cancelled'"
        class="flex flex-row items-center px-2"
      >
        <div class="grow w-full">{{ operation.name }} cancelled.</div>
        <Button
          size="small"
          icon="pi pi-times"
          variant="text"
          @click="$emit('clear', operation.taskId)"
        />
      </div>
      <div
        v-if="operation.status === 'failure'"
        class="flex flex-row items-center px-2"
      >
        <div class="grow w-full">{{ operation.name }} failed.</div>
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
