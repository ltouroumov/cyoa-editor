<template>
  <div
    class="flex flex-row gap-3 items-start p-2 border rounded"
    :class="{
      'border-primary': isDefault,
      'border-surface-700': !isDefault,
    }"
  >
    <div class="flex flex-col gap-2 grow">
      <div class="flex flex-col">
        <div class="font-bold">
          {{ style.name || style.id }}
        </div>
        <div class="text-sm text-muted-color">
          {{ style.type }} - {{ style.target }}
        </div>
      </div>
      <div v-if="style.comment" class="text-sm text-muted-color">
        {{ style.comment }}
      </div>
    </div>
    <div class="flex flex-row gap-2">
      <Button
        size="small"
        variant="outlined"
        severity="secondary"
        @click="editStyle"
      >
        <span class="iconify solar--pen-line-duotone" />
        Edit
      </Button>
      <CardMenu :object-id="style.id" :type="EntityType.Style" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { EntityType } from '~/composables/project/types/v2/base';
import type { AnyStyle } from '~/composables/project/types/v2/styles';

const editorStore = useEditorStore();

const props = defineProps<{
  style: AnyStyle;
  isDefault?: boolean;
}>();

function editStyle() {
  editorStore.pushScreen({
    type: 'edit-style',
    styleId: props.style.id,
  });
}
</script>

<style scoped lang="scss"></style>
