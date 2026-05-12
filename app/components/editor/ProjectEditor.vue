<template>
  <div class="flex flex-col p-2 gap-2 h-full w-full">
    <Menubar :model="menu" class="rounded">
      <template #end>
        <div class="flex flex-row items-center gap-2">
          <div v-if="false" class="flex flex-row items-center">
            <label class="me-2">Preview</label>
            <ToggleSwitch v-model="preview" size="small" variant="outlined" />
          </div>
          <Button
            :unstyled="true"
            class="flex flex-row items-center border border-surface-500 rounded ps-3 pe-2 py-1 relative cursor-pointer h-8"
            @click="editorStore.toggleOmniBar(true)"
          >
            <div class="hidden lg:block text-sm text-muted-color me-2">
              Search ...
            </div>
            <div
              class="block lg:hidden w-4 border-b border-surface-300 h-5"
            ></div>
            <div class="block lg:hidden h-5 w-8"></div>
            <div class="size-5 iconify solar--magnifer-outline"></div>
          </Button>
          <Button
            :unstyled="true"
            class="flex flex-row items-center border border-surface-500 rounded px-2 py-1 relative cursor-pointer h-8"
            @click="editorStore.toggleClipboard(true)"
          >
            <div class="text-sm text-muted-color me-1">Clipboard</div>
            <div
              class="size-5 iconify solar--clipboard-list-bold-duotone"
            ></div>
          </Button>
          <!-- <Divider layout="vertical" />
          <h1 class="text-amber-500 text-xl">
            {{ editorStore.project!.name }}
          </h1> -->
        </div>
      </template>
    </Menubar>
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
import type { MenuItem } from 'primevue/menuitem';

import EditorBreadcrumbs from '~/components/editor/screens/EditorBreadcrumbs.vue';
import { useScreenDispatch } from '~/components/editor/screens/useScreenDispatch';
import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';
import { useEditorStore } from '~/composables/editor/useEditorStore';

const { unloadProject, saveProject } = useEditorLibrary();
const editorStore = useEditorStore();
const { screen } = useScreenDispatch();

const preview = ref<boolean>(false);
const menu: MenuItem[] = [
  {
    label: 'Project',
    icon: 'iconify solar--file-bold-duotone',
    items: [
      {
        label: 'Auto Save',
        items: [
          {
            label: 'Disabled',
          },
          {
            label: '1 Minute',
            icon: 'iconify solar--check-circle-line-duotone',
          },
          { label: '2 Minutes' },
          { label: '5 Minutes' },
          { label: '10 Minutes' },
        ],
      },

      { separator: true },
      {
        label: 'Save',
        icon: 'iconify solar--file-download-bold-duotone',
        command: async () => {
          await saveProject();
        },
      },
      {
        label: 'Close',
        icon: 'iconify solar--file-remove-bold-duotone',
        command: () => {
          unloadProject();
        },
      },
    ],
  },
  { separator: true, class: 'border-l border-surface-700 h-4' },
  {
    label: 'Content',
    icon: 'iconify solar--documents-minimalistic-line-duotone',
    command: () => {
      editorStore.clearStack('content');
    },
  },
  {
    label: 'Media',
    icon: 'iconify solar--gallery-line-duotone',
    command: () => {
      editorStore.clearStack('media');
    },
  },
  {
    label: 'Styles',
    icon: 'iconify solar--pallete-2-line-duotone',
    command: () => {
      editorStore.clearStack('styles');
    },
  },
];

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
