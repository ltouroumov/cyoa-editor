<template>
  <div class="flex flex-row px-2 border border-surface-600 rounded">
    <template v-if="entry.type === 'object'">
      <ObjectClipboardEntry
        :object="entry.data"
        :from="entry.from"
        class="grow py-2"
      />
    </template>
    <template v-else-if="entry.type === 'score'">
      <ScoreClipboardEntry :object="entry.data" class="grow py-2" />
    </template>
    <div class="border-l border-surface-600 mx-2"></div>
    <div class="flex flex-row gap-2 py-2">
      <IconButton
        variant="outlined"
        icon="iconify solar--clipboard-add-line-duotone"
      />
      <IconButton
        variant="outlined"
        severity="danger"
        icon="iconify solar--trash-bin-trash-line-duotone"
        @click="clipboardUtils.removeFromClipboard(entry.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClipboardItem } from '~/composables/project/types/v2/clipboard';
import { useProjectClipboard } from '~/composables/project/useProjectClipboard';

const clipboardUtils = useProjectClipboard();

const props = defineProps<{
  entry: ClipboardItem;
}>();
</script>

<style scoped lang="scss"></style>
