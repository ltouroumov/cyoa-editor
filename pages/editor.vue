<template>
  <div
    v-if="store.status !== 'loaded'"
    class="flex flex-col justify-stretch items-center py-5 h-[100%]"
  >
    <ProjectLibrary class="grow w-[80%]" />
  </div>
  <LazyProjectEditor v-if="isNotNil(project)" />
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
</script>

<style>
@import '~/assets/css/bootstrap/grid.scss';

body {
  background: var(--p-stone-700);
  width: 100vw;
  height: 100vh;
}
</style>
