<template>
  <div :id="`row-${row.id}`" class="project-row-wrapper">
    <StyleRow
      v-if="row.isPrivateStyling"
      :styles="row.styling"
      row-id="row.id"
    />
    <div class="project-row" :class="{ hidden: !isVisible }">
      <div class="row-body">
        <img
          v-if="row.image"
          class="row-image"
          :src="row.image"
          :alt="row.title"
        />
        <div class="row-title">{{ row.title }}</div>
        <div v-if="row.titleText" class="row-text">{{ row.titleText }}</div>
      </div>
      <div class="container-fluid p-0">
        <div class="row g-2">
          <ViewProjectObj
            v-for="obj in row.objects"
            :key="obj.id"
            :obj="obj"
            :row="row"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import StyleRow from '~/components/viewer/style/StyleRow.vue';
import { buildConditions } from '~/composables/conditions';
import { ProjectRow } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';

const { row } = defineProps<{
  row: ProjectRow;
}>();

const { selectedIds } = useProjectRefs();

const condition = buildConditions(row);
const isVisible = computed(() => condition(selectedIds.value));
</script>

<style lang="scss">
.project-row {
  // Prevents collapsing margins with .row-body
  display: flex;
  flex-direction: column;

  &.hidden {
    display: none;
  }

  .row-meta {
    display: flex;
    flex-direction: column;
  }
}
</style>
