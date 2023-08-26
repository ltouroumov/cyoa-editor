<template>
  <nav class="navbar fixed-bottom navbar-dark bg-dark">
    <div class="container-fluid justify-content-between">
      <div>
        <button class="btn btn-dark btn-lg i-solar-book-bold" />
      </div>
      <ViewScoreStatus />
      <div class="d-flex gap-2">
        <button
          class="btn btn-light btn-lg i-solar-backpack-outline"
          @click="toggleBackpack()"
        />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import ViewScoreStatus from '~/components/viewer/ViewScoreStatus.vue';
import { useViewerStore } from '~/composables/store/viewer';

const { toggleBackpack } = useViewerStore();
</script>
