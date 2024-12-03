<template>
  <div
    v-if="store.status !== 'loaded'"
    class="flex flex-col justify-stretch items-center py-5 h-[100%]"
  >
    <ProjectLibrary class="grow w-[80%]" />
  </div>
  <div v-if="isNotNil(project)" class="container-fluid">
    <div class="row p-1">
      <Menubar :model="menu">
        <template #end>
          <div class="flex flex-row items-center">
            <div class="flex flex-row items-center">
              <label class="me-2">Preview</label>
              <ToggleSwitch v-model="preview" size="small" variant="outlined" />
            </div>
            <Divider layout="vertical" />
            <h1 class="text-amber-500 text-xl">
              {{ project.projectName }}
            </h1>
          </div>
        </template>
      </Menubar>
    </div>
    <div v-if="preview">PREVIEW</div>
    <div v-if="!preview">EDITOR</div>
  </div>
  <DynamicDialog />
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const { unloadProject } = useProjectStore();
const { store, project } = useProjectRefs();

const preview = ref<boolean>(false);
const menu = [
  {
    label: 'Project',
    icon: 'iconify solar--file-bold-duotone',
  },
  {
    label: 'Features',
    icon: 'pi pi-star',
  },
  {
    label: 'Projects',
    icon: 'pi pi-search',
    items: [
      {
        label: 'Components',
        icon: 'pi pi-bolt',
      },
      {
        label: 'Blocks',
        icon: 'pi pi-server',
      },
      {
        label: 'UI Kit',
        icon: 'pi pi-pencil',
      },
      {
        label: 'Templates',
        icon: 'pi pi-palette',
        items: [
          {
            label: 'Apollo',
            icon: 'pi pi-palette',
          },
          {
            label: 'Ultima',
            icon: 'pi pi-palette',
          },
        ],
      },
    ],
  },
  {
    label: 'Contact',
    icon: 'pi pi-envelope',
  },
];

const doUnload = () => {
  unloadProject();
};
</script>

<style>
@import '~/assets/css/bootstrap/grid.scss';

body {
  background: var(--p-stone-700);
  width: 100vw;
  height: 100vh;
}
</style>
