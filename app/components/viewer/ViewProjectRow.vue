<template>
  <div :id="`row-${row.id}`" class="project-row-wrapper">
    <StyleRow
      v-if="row.isPrivateStyling"
      :styles="row.styling!"
      :row-id="row.id"
    />
    <div
      class="project-row"
      :class="{ hidden: !isVisible, hasPrivateStyle: row.isPrivateStyling }"
    >
      <ViewImage
        v-if="row.image && !display?.hideRowImages"
        class="row-image"
        :element="row"
        :always-enable="false"
      />
      <div v-if="row.title || row.titleText" class="row-header">
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="row.title"
          class="row-title"
          v-html="formatText(row.title)"
        />
        <div
          v-if="row.titleText && !display?.hideRowText"
          class="row-text"
          v-html="formatText(row.titleText)"
        />
        <!-- eslint-enable vue/no-v-html -->
      </div>
      <CollectionLoader
        v-if="row.objects.length > 0"
        :is-visible="isVisible"
        :items="row.objects"
        :step="10"
        :wrapper="{ tag: 'div', props: { class: 'row g-2' } }"
      >
        <template #item="{ item }">
          <ViewProjectObj
            :key="item.id"
            :obj="item"
            :row="row"
            :display="display"
          />
        </template>
        <template #loader>
          <div class="row g-2">
            <div
              v-for="obj in row.objects"
              :key="obj.id"
              :class="getSizeClasses(obj, row)"
            >
              <Skeleton width="100%" height="200px" />
            </div>
          </div>
        </template>
      </CollectionLoader>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { getSizeClasses } from '~/components/viewer/style/sizes';
import StyleRow from '~/components/viewer/style/StyleRow.vue';
import CollectionLoader from '~/components/viewer/utils/CollectionLoader.vue';
import { buildConditions } from '~/composables/conditions';
import type { ProjectRow } from '~/composables/project/types/v1';
import { useProjectRefs } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';
import { formatText } from '~/composables/text';

const { row } = defineProps<{
  row: ProjectRow;
  display?: DisplaySettings;
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

  .row-header {
    overflow: auto;
  }
}
</style>
