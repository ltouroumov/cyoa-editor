<template>
  <IconButton
    severity="secondary"
    variant="outlined"
    size="small"
    icon="iconify solar--menu-dots-bold-duotone"
    @click="openMenu($event)"
  />
  <Menu ref="menu" :model="menuItems" :popup="true">
    <template #item="{ item }">
      <a
        class="px-2 py-1 flex items-center gap-1 cursor-pointer"
        :class="item.class"
      >
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';

import { ObjectTypeNames } from '~/composables/editor/const';
import { useProjectWriter } from '~/composables/editor/useProjectWriter';
import type { AnyObject } from '~/composables/project/types/v2/objects';
import { useProjectClipboard } from '~/composables/project/useProjectClipboard';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $confirm = useConfirm();

const projectStore = useProjectStore();
const projectWriter = useProjectWriter();
const clipboardUtils = useProjectClipboard();

const props = defineProps<{
  objectId: string;
}>();

const object = computed(
  (): AnyObject => projectStore.getObject(props.objectId)!,
);

const menu = ref();
const menuItems: MenuItem[] = [
  {
    label: 'Clone',
    icon: 'iconify solar--copy-line-duotone',
    command: () => {
      console.log('Clone command triggered');
    },
  },
  {
    label: 'Move',
    icon: 'iconify solar--arrow-right-up-line-duotone',
    command: () => {
      console.log('Move command triggered');
    },
  },
  {
    label: 'Copy',
    icon: 'iconify solar--clipboard-text-line-duotone',
    command: () => {
      const parentId = projectStore.getParent(props.objectId);
      clipboardUtils.copyObject(props.objectId, parentId);
    },
  },
  {
    label: 'Cut',
    icon: 'iconify solar--scissors-line-duotone',
    command: () => {
      console.log('Cut command triggered');
    },
  },
  { separator: true },
  {
    label: 'Delete',
    icon: 'iconify solar--trash-bin-trash-line-duotone',
    class: 'text-red-400',
    command: () => {
      deleteObject();
    },
  },
];

const openMenu = ($event: any) => {
  menu.value.toggle($event);
};

function deleteObject() {
  $confirm.require({
    group: 'modal',
    icon: 'pi pi-exclamation-triangle',
    header: `Remove ${ObjectTypeNames[object.value.type]}`,
    message: 'Are you sure?',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
    },
    accept: () => {
      projectWriter.removeObject(props.objectId);
    },
  });
}
</script>

<style scoped lang="scss"></style>
