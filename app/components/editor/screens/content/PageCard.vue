<template>
  <div class="border border-surface-500 flex flex-col p-2 rounded">
    <div class="flex flex-row gap-2">
      <div
        class="text-primary text-xl text-bold inline-flex items-center cursor-pointer grow"
        @click="editPage()"
      >
        <i class="iconify solar--document-text-line-duotone"></i>
        <span class="grow">{{ page.name }}</span>
        <span class="font-mono text-sm text-surface-500">
          {{ page.id }}
        </span>
      </div>
      <div class="flex flex-row gap-2 justify-end">
        <Button size="small" variant="outlined" severity="secondary">
          Clone
        </Button>
        <Button
          size="small"
          variant="outlined"
          severity="danger"
          @click="deletePage()"
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { useProjectWriter } from '~/composables/editor/useProjectWriter';
import type { PageObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();
const projectWriter = useProjectWriter();

const props = defineProps<{
  pageId: string;
}>();

const page = computed((): PageObject => {
  return projectStore.get(props.pageId, ObjectType.page)!;
});

function editPage() {
  editorStore.pushScreen({
    type: 'edit-page',
    pageId: page.value.id,
  });
}

const deletePage = () => {
  projectWriter.removeObject(props.pageId);
};
</script>

<style scoped lang="scss"></style>
