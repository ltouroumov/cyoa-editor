<template>
  <ViewMenuBar />
  <div class="project">
    <div class="rows">
      <ViewProjectRow
        v-for="row in project.rows"
        :key="row.id"
        :row="row"
        :display="display"
      />
    </div>
  </div>
  <ScrollToTopButton />
  <StyleProject :styles="project.styling" />
  <BackpackModal />
  <NotesModal />
  <SearchModal />
  <MenuModal />

  <Toast />
  <ConfirmPopup group="popup" />
  <ConfirmDialog group="modal" />
</template>

<script setup lang="ts">
import BackpackModal from '~/components/viewer/modal/BackpackModal.vue';
import MenuModal from '~/components/viewer/modal/MenuModal.vue';
import NotesModal from '~/components/viewer/modal/NotesModal.vue';
import SearchModal from '~/components/viewer/modal/SearchModal.vue';
import StyleProject from '~/components/viewer/style/StyleProject.vue';
import ViewMenuBar from '~/components/viewer/ViewMenuBar.vue';
import type { Project } from '~/composables/project/types/v1';
import { useSettingStore } from '~/composables/store/settings';

defineProps<{
  project: Project;
}>();

const { resolveDisplaySettings } = useSettingStore();

const display = computed(() => resolveDisplaySettings());
</script>
<style lang="scss">
.project {
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;

  .rows {
    // Prevents collapsing margins
    display: flex;
    flex-direction: column;
    align-items: stretch;

    max-width: 2000px;

    .project-row-wrapper {
      flex: 1 1 100%;
    }
  }
}
</style>
