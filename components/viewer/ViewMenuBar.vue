<template>
  <Toolbar
    class="sticky-top sticky top-0"
    :dt="{ padding: '0.3rem', border: { radius: 0, color: null } }"
  >
    <template #start>
      <div class="flex flex-row items-center">
        <Button
          variant="text"
          icon="iconify solar--hamburger-menu-outline"
          severity="contrast"
          :dt="MenuButtonDT"
          @click="toggleProjectMenu()"
        />
      </div>
    </template>
    <template #center>
      <ViewScoreStatus short class="item-scores" />
    </template>
    <template #end>
      <div class="flex gap-1 items-center">
        <Button
          variant="text"
          severity="contrast"
          icon="iconify solar--magnifer-outline"
          :dt="MenuButtonDT"
          @click="toggleSearch()"
        />
        <Button
          variant="text"
          severity="contrast"
          :dt="MenuButtonDT"
          icon="iconify solar--backpack-outline"
          @click="toggleBackpack()"
        />
        <Button
          variant="text"
          severity="contrast"
          :dt="MenuButtonDT"
          icon="iconify solar--notes-outline"
          @click="toggleNotes()"
        />
        <Button
          v-if="hasLoadedBuild"
          variant="text"
          severity="contrast"
          :dt="MenuButtonDT"
          class="iconify solar--diskette-outline"
          @click="updateCurrentBuild()"
        />
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';
import { useToast } from 'vue-toastification';

import ViewScoreStatus from '~/components/viewer/ViewScoreStatus.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { useBuildLibrary } from '~/composables/viewer/useBuildLibrary';

const { toggleBackpack, toggleSearch, toggleProjectMenu, toggleNotes } =
  useViewerStore();
const { buildData, buildModified } = useProjectRefs();
const $lib = useBuildLibrary();
const $toast = useToast();

const MenuButtonDT = {
  padding: { x: 0, y: 0 },
  border: { radius: 0 },
  icon: { only: { width: '2rem' } },
};

const hasLoadedBuild = computed(() => {
  return isNotNil(buildData.value);
});

const updateCurrentBuild = async () => {
  if (isNotNil(buildData.value)) {
    await $lib.updateBuild(buildData.value);
    buildModified.value = false;
    $toast.info('Build saved');
  }
};
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

.navbar {
  background: $dark-bg-subtle-dark;
}

@media (min-width: 576px) {
  .menu-container {
    width: 100%;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (max-width: 576px) {
  .menu-container {
    width: 100%;

    display: grid;
    grid-template:
      'menu tools' auto
      'scores scores' auto
      / 1fr 1fr;
    gap: 0.2rem;

    .item-menu {
      grid-area: menu;
      justify-self: start;
    }
    .item-tools {
      grid-area: tools;
      justify-self: end;
    }
    .item-scores {
      grid-area: scores;
      justify-self: center;
    }
  }
}

body:has(.menu-modal.show) .navbar {
  z-index: $zindex-offcanvas;
}
</style>
