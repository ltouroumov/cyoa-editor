<template>
  <div class="flex flex-col p-2 gap-2 h-full w-full">
    <EditorMenuBar />
    <div v-if="preview">PREVIEW</div>
    <Card
      v-if="!preview"
      class="grow rounded"
      :dt="{ body: { padding: '1rem' } }"
    >
      <template #header>
        <div class="flex flex-row justify-between">
          <EditorBreadcrumbs />
          <div class="flex flex-row items-center">
            <ScreenActions />
          </div>
        </div>
        <div class="border-t border-surface-700"></div>
      </template>
      <template #content>
        <component :is="screen.component" v-bind="screen.props ?? {}" />
      </template>
    </Card>
  </div>
  <OmniBar />
  <ClipboardPanel />
</template>

<script setup lang="ts">
import EditorBreadcrumbs from '~/components/editor/screens/EditorBreadcrumbs.vue';
import { useScreenDispatch } from '~/components/editor/screens/useScreenDispatch';
import { useEditorStore } from '~/composables/editor/useEditorStore';

const editorStore = useEditorStore();
const { screen } = useScreenDispatch();

const preview = ref<boolean>(false);

const { ctrl_k, esc } = useMagicKeys({
  passive: false,
  onEventFired(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'k' && e.type === 'keydown') {
      e.preventDefault();
    }
  },
});
watch(ctrl_k, (newValue) => {
  if (newValue && !editorStore.showOmniBar) {
    editorStore.showOmniBar = true;
  }
});

watch(esc, (newValue) => {
  if (newValue && editorStore.showOmniBar) {
    editorStore.showOmniBar = false;
  }
});
</script>

<style scoped lang="scss"></style>
