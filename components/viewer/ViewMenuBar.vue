<template>
  <nav
    class="navbar sticky-top navbar-expand-lg navbar-dark bg-dark-subtle text-white"
  >
    <div class="container-fluid">
      <div class="d-flex flex-row items-center">
        <button
          class="btn btn-light btn-lg i-solar-hamburger-menu-outline"
          @click="toggleProjectMenu()"
        />
      </div>
      <ViewScoreStatus short />
      <div class="d-flex gap-1">
        <button
          class="btn btn-light btn-lg i-solar-magnifer-outline"
          @click="toggleSearch(true)"
        />
        <button
          class="btn btn-light btn-lg i-solar-backpack-outline"
          @click="toggleBackpack(true)"
        />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import ViewScoreStatus from '~/components/viewer/ViewScoreStatus.vue';
import { useViewerStore } from '~/composables/store/viewer';

const { toggleBackpack, toggleSearch, toggleProjectMenu } = useViewerStore();
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

.navbar {
  position: sticky;
  height: 40px;
}

body:has(.menu-modal.show) .navbar {
  z-index: $zindex-offcanvas;
}
</style>
