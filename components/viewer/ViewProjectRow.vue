<template>
  <div :id="`row-${row.id}`" class="project-row-wrapper">
    <StyleRow
      v-if="row.isPrivateStyling"
      :styles="row.styling"
      :row-id="row.id"
    />
    <div class="project-row" :class="{ hidden: !isVisible }">
      <img
        v-if="row.image"
        class="row-image"
        :src="row.image"
        :alt="row.title"
      />
      <div class="row-body">
        <div class="row-title">{{ row.title }}</div>
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="row.titleText"
          class="row-text"
          v-html="formatText(row.titleText)"
        />
        <!-- eslint-enable vue/no-v-html -->
      </div>
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
</template>

<script setup lang="ts">
import { computed } from 'vue';

import StyleRow from '~/components/viewer/style/StyleRow.vue';
import { buildConditions } from '~/composables/conditions';
import { ProjectRow } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';
import { formatText } from '~/composables/text';

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
  align-items: stretch;

  &.hidden {
    display: none;
  }

  .margin {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .row-meta {
    display: flex;
    flex-direction: column;
  }
}
</style>
