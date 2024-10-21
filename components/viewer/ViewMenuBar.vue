<template>
  <nav
    class="navbar sticky-top navbar-expand-lg navbar-dark bg-dark-subtle text-white"
  >
    <div class="menu-container">
      <div class="d-flex item-menu flex-row items-center">
        <button
          class="btn btn-light btn-lg i-solar-hamburger-menu-outline"
          @click="toggleProjectMenu()"
        />
      </div>
      <ViewScoreStatus short class="item-scores" />
      <div class="d-flex item-tools gap-1">
        <button
          class="btn btn-light btn-lg i-solar-magnifer-outline"
          @click="toggleSearch()"
        />
        <button
          class="btn btn-light btn-lg i-solar-backpack-outline"
          @click="toggleBackpack()"
        />
        <button
          class="btn btn-light btn-lg i-solar-notes-outline"
          @click="toggleNotes()"
        />
        <button
          v-if="hasLoadedBuild"
          class="btn btn-lg i-solar-diskette-outline"
          @click="updateCurrentBuild()"
        />
      </div>
    </div>
  </nav>
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
  position: sticky;
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
