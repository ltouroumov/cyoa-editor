<template>
  <li
    class="menu-item relative"
    :class="{ 'has-drop': isNotNil(item.menu), active: showMenu }"
  >
    <div class="item-content">
      <a class="item-link" @click="item.command?.call(item)">
        <span class="item-icon" :class="item.icon"></span>
        <span class="item-label">{{ item.label }}</span>
      </a>
    </div>
    <div v-if="item.menu" class="item-drop">
      <a ref="menuToggle" class="item-link" @click="toggleMenu()">
        <span
          class="iconify solar--menu-dots-bold-duotone size-4 text-muted-color"
        ></span>
      </a>
    </div>
    <div
      v-if="item.menu"
      class="absolute top-full left-0 z-100 pt-1"
      :class="{ visible: showMenu, invisible: !showMenu }"
    >
      <Menu ref="menu" :model="item.menu" />
    </div>
  </li>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import type { MenuBarItemData } from '~/components/editor/menu/types';

defineProps<{ item: MenuBarItemData }>();

const menu = ref();
const menuToggle = ref();
const showMenu = ref<boolean>(false);

const toggleMenu = () => {
  console.log('Toggling menu visibility');
  showMenu.value = !showMenu.value;
};

const stopMenuClickOutside = onClickOutside(
  menu,
  () => {
    if (!showMenu.value) return;

    console.log('Stopping menu click outside');
    showMenu.value = false;
  },
  { ignore: [menuToggle] },
);

onUnmounted(() => {
  stopMenuClickOutside();
});
</script>

<style scoped lang="scss">
.menu-item {
  display: flex;
  flex-direction: row;

  color: var(--p-menubar-item-color);
  border-radius: var(--p-menubar-item-border-radius);

  border: 1px solid var(--color-surface-700);

  transition:
    background var(--p-menubar-transition-duration),
    color var(--p-menubar-transition-duration);
}

.menu-item:hover,
.menu-item.active {
  background: var(--p-menubar-item-focus-background);
}

.item-content,
.item-drop {
  transition:
    background var(--p-menubar-transition-duration),
    color var(--p-menubar-transition-duration);

  color: var(--p-menubar-item-color);
  border-radius: var(--p-menubar-item-border-radius);
}
.item-drop {
  border-left: 1px solid var(--color-surface-800);
}

.menu-item.has-drop > .item-content {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.menu-item.has-drop > .item-drop {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.item-content:hover,
.item-drop:hover {
  color: var(--p-menubar-item-focus-color);
  background: var(--color-surface-700);
}

.item-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  text-decoration: none;
  overflow: hidden;
  position: relative;
  color: inherit;
  padding: var(--p-menubar-item-padding);
  gap: var(--p-menubar-item-gap);
  user-select: none;
  outline: 0 none;
}

.menu-item.has-drop > .item-content > .item-link {
  padding-right: 0.5rem;
}

.menu-item.has-drop > .item-drop > .item-link {
  padding-left: 0.5rem;
}

.item-icon {
  color: var(--p-menubar-item-icon-color);
}

.item-label {
  line-height: 1;
}
</style>
