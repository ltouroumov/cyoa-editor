<template>
  <ViewMenuBar />
  <div class="project">
    <div class="rows">
      <ViewProjectRow v-for="row in project.rows" :key="row.id" :row="row" />
    </div>
  </div>
  <StyleProject :styles="project.styling" />
  <BackpackModal />
  <SearchModal />
  <MenuModal />
</template>

<script setup lang="ts">
import BackpackModal from '~/components/viewer/modal/BackpackModal.vue';
import MenuModal from '~/components/viewer/modal/MenuModal.vue';
import SearchModal from '~/components/viewer/modal/SearchModal.vue';
import StyleProject from '~/components/viewer/style/StyleProject.vue';
import ViewMenuBar from '~/components/viewer/ViewMenuBar.vue';

const { project } = defineProps<{
  project: Project;
}>();
</script>
<style lang="scss">
.project {
  font-family: sans-serif;

  .rows {
    // Prevents collapsing margins
    display: flex;
    flex-direction: column;
    align-items: stretch;

    .project-row-wrapper {
      flex: 1 1 100%;
    }
  }
}
</style>
