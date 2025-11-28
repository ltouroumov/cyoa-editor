<template>
  <div ref="backpackRef" class="backpack-container">
    <div v-if="showTitle" class="project-title text-primary text-3xl">
      {{ project?.projectName }}
    </div>
    <div class="pack-info-container">
      <div class="pack-scores text-surface-0">
        <ViewScoreStatus :vertical="verticalScore" />
      </div>
    </div>
    <div
      v-for="{ packRow, choices, scores } in packRows"
      :key="packRow.id"
      class="pack-row"
    >
      <div class="pack-row-title-container">
        <span class="pack-row-title text-primary">{{ packRow.title }}</span>

        <div class="pack-row-info">
          <RowScores :scores="scores" :horizontal="true" />
        </div>
      </div>
      <div class="row g-2">
        <ViewProjectObj
          v-for="{ obj, row } in choices"
          :key="obj.id"
          :obj="obj"
          :row="row"
          :width="packRow.objectWidth"
          :view-object="objectMode"
          :display="display"
          :allow-overflow="true"
          :show-addons="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import RowScores from '~/components/viewer/utils/RowScores.vue';
import { useProjectStore } from '~/composables/store/project';
import type { DisplaySettings } from '~/composables/store/settings';
import { ViewContext } from '~/composables/viewer';
import { useBackpack } from '~/composables/viewer/useBackpack';

const $props = defineProps<{
  showTitle: boolean;
  verticalScore: boolean;
  lockBackpack: boolean;
  display: DisplaySettings;
}>();

const { project } = useProjectStore();
const { packRows } = useBackpack();

const objectMode = computed(() => {
  if ($props.lockBackpack) return ViewContext.BackpackDisabled;
  else return ViewContext.BackpackEnabled;
});
</script>

<style lang="scss">
.pack-info-container {
  display: flex;
  position: relative;

  .pack-scores {
    margin-bottom: 0.5rem;
  }

  .pack-selection-controls {
    display: flex;
    position: absolute;
    right: 0;
    padding-right: 0.5rem;
  }
}

.pack-row {
  padding: 0;
  margin-bottom: 0.5rem;

  .pack-row-title-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .pack-row-title {
    font-size: 1.5rem;
    font-weight: bolder;
    text-align: center;
    margin-bottom: 0.2rem;
  }

  .choice {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
