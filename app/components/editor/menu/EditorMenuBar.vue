<template>
  <div class="p-component p-menubar rounded">
    <div class="flex flex-row items-center gap-2">
      <MenuButton
        icon="iconify solar--hamburger-menu-line-duotone"
        @click="toggleMenu()"
      />
    </div>
    <div class="h-[50%] my-2 border-l border-surface-700"></div>
    <ul class="flex flex-row items-center gap-2 grow">
      <li v-for="(tab, idx) in TABS" :key="idx" class="p-menubar-item">
        <div class="p-menubar-item-content">
          <a class="p-menubar-item-link" @click="tab.command">
            <span class="p-menubar-item-icon" :class="tab.icon"></span>
            <span class="p-menubar-item-label">{{ tab.label }}</span>
          </a>
        </div>
      </li>
    </ul>
    <div class="flex flex-row items-center gap-2">
      <Button
        :unstyled="true"
        class="flex flex-row items-center border border-surface-500 rounded ps-3 pe-2 py-1 relative cursor-pointer h-8"
        @click="editorStore.toggleOmniBar(true)"
      >
        <div class="hidden lg:block text-sm text-muted-color me-2">
          Search ...
        </div>
        <div class="block lg:hidden w-4 border-b border-surface-300 h-5"></div>
        <div class="block lg:hidden h-5 w-8"></div>
        <div class="size-5 iconify solar--magnifer-outline"></div>
      </Button>
      <Button
        :unstyled="true"
        class="flex flex-row items-center border border-surface-500 rounded px-2 py-1 relative cursor-pointer h-8"
        @click="editorStore.toggleClipboard(true)"
      >
        <div class="text-sm text-muted-color me-1">Clipboard</div>
        <div class="size-5 iconify solar--clipboard-list-bold-duotone"></div>
      </Button>
    </div>
  </div>
  <Drawer v-model:visible="showMenu">
    <template #container="{ closeCallback }">
      <div class="flex flex-col gap-2 p-4">
        <div
          class="font-bold text-surface-400 border-b border-surface-700 pb-2"
        >
          Project
        </div>
        <div class="font-bold text-primary truncate">
          {{ editorStore.project!.name }}
        </div>
        <MenuItem
          :icon="
            editorStore.autoSaveInterval === 'off'
              ? 'iconify solar--stopwatch-pause-line-duotone'
              : 'iconify solar--stopwatch-play-line-duotone'
          "
          icon-end="iconify solar--alt-arrow-right-line-duotone"
          @click="autoSaveMenu.toggle($event)"
        >
          <div class="flex flex-col">
            <div>Auto-Save</div>
            <div class="text-sm text-muted-color">
              {{
                match(editorStore.autoSaveInterval)
                  .with('off', () => 'Disabled')
                  .with('auto', () => 'Enabled')
                  .with(
                    P.number,
                    (interval) => `${humanizeSaveInterval(interval)}`,
                  )
                  .exhaustive()
              }}
            </div>
          </div>
        </MenuItem>
        <MenuItem
          icon="iconify solar--file-download-bold-duotone"
          @click="library.saveProject(true)"
        >
          Save Project
        </MenuItem>
        <MenuItem
          icon="iconify solar--file-remove-bold-duotone"
          @click="library.unloadProject()"
        >
          Close Project
        </MenuItem>
      </div>
    </template>
  </Drawer>
  <Menu ref="autoSaveMenu" :popup="true" :model="autoSaveUtils.menuOptions" />
</template>

<script setup lang="ts">
import { P, match } from 'ts-pattern';

import MenuItem from '~/components/editor/menu/MenuItem.vue';
import { useEditorAutoSave } from '~/composables/editor/useEditorAutoSave';
import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';
import { useEditorStore } from '~/composables/editor/useEditorStore';

const library = useEditorLibrary();
const editorStore = useEditorStore();
const autoSaveUtils = useEditorAutoSave();

const autoSaveMenu = ref();

const showMenu = ref<boolean>(false);
const toggleMenu = (set?: boolean) => {
  showMenu.value = set ?? !showMenu.value;
};

const TABS = [
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

const humanizeSaveInterval = (intervalMs: number): string => {
  if (intervalMs < 1000) {
    return `${intervalMs}ms`;
  }
  const seconds = Math.floor(intervalMs / 1000);
  if (seconds > 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  } else {
    return `${seconds} seconds`;
  }
};
</script>

<style scoped lang="scss"></style>
