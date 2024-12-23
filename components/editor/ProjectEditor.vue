<template>
  <div class="flex flex-col p-2 gap-2 h-full">
    <Menubar :model="menu" class="rounded">
      <template #end>
        <div class="flex flex-row items-center">
          <div class="flex flex-row items-center">
            <label class="me-2">Preview</label>
            <ToggleSwitch v-model="preview" size="small" variant="outlined" />
          </div>
          <Divider layout="vertical" />
          <h1 class="text-amber-500 text-xl">
            {{ editorStore.project!.name }}
          </h1>
        </div>
      </template>
    </Menubar>
    <div v-if="preview">PREVIEW</div>
    <Card v-if="!preview" class="grow rounded">
      <template #header>
        <div class="flex flex-row justify-between">
          <Breadcrumb
            :home="bcHome"
            :model="bcStack"
            :dt="{ background: 'none' }"
          />
          <div class="flex flex-row items-center pe-4">
            <Button>New Row</Button>
          </div>
        </div>
        <div class="border-t border-surface-700"></div>
      </template>
      <template #content>
        <component :is="screen.component" v-bind="screen.props ?? {}" />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';

import { useScreenDispatch } from '~/components/editor/screens/useScreenDispatch';
import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { useProjectStore } from '~/composables/project/useProjectStore';

const { unloadProject } = useEditorLibrary();
const editorStore = useEditorStore();
const projectStore = useProjectStore();
const { screen } = useScreenDispatch();

const bcHome: MenuItem = ref<MenuItem>({
  label: 'Pages',
  icon: 'iconify solar--documents-line-duotone',
});
const bcStack = ref<MenuItem[]>([
  // {
  //   label: 'Main',
  //   icon: 'iconify solar--document-text-line-duotone',
  // },
  // {
  //   label: 'Meta',
  //   icon: 'iconify solar--list-line-duotone',
  // },
  // {
  //   label: 'You',
  //   icon: 'iconify solar--check-square-line-duotone',
  // },
]);

const preview = ref<boolean>(false);
const menu = [
  {
    label: 'Project',
    icon: 'iconify solar--file-bold-duotone',
    items: [
      {
        label: 'Save',
        icon: 'iconify solar--file-download-bold-duotone',
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
];
</script>

<style scoped lang="scss"></style>
