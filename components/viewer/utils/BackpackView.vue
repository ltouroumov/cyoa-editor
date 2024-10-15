<template>
  <div
    ref="backpackRef"
    class="backpack-container"
    :class="{ backpackRender: isLoading }"
  >
    <div v-if="isLoading" class="project-title">
      {{ project?.projectName }}
    </div>
    <div class="pack-info-container">
      <div class="pack-scores">
        <ViewScoreStatus :vertical="!isLoading" />
      </div>
    </div>
    <div
      v-for="{ packRow, choices } in packRows"
      :key="packRow.id"
      class="pack-row"
    >
      <div class="pack-row-title">
        {{ packRow.title }}
      </div>
      <div class="container-fluid p-0">
        <div class="row g-2">
          <ViewProjectObj
            v-for="{ obj, row } in choices"
            :key="obj.id"
            :obj="obj"
            :row="row"
            :width="packRow.objectWidth"
            :view-object="objectMode"
            :hide-disabled-addons="!disabledAddonsInBackpack"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import type { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useSettingRefs } from '~/composables/store/settings';
import { ViewContext } from '~/composables/viewer';

defineProps<{
  isLoading: boolean;
}>();

const { getObject, getObjectRow, getRow, project } = useProjectStore();
const { selected, backpack } = useProjectRefs();
const { disabledAddonsInBackpack, lockBackpackObjects } = useSettingRefs();

type PackRowChoice = { row: ProjectRow; obj: ProjectObj; count: number };
type PackRow = { packRow: ProjectRow; choices: PackRowChoice[] };
const packRows = computed(() => {
  const selectedChoices = R.map(
    ([id, count]): PackRowChoice => ({
      obj: getObject(id),
      row: getRow(getObjectRow(id)),
      count,
    }),
    R.toPairs(selected.value),
  );
  const choicesByGroup: Partial<Record<string, PackRowChoice[]>> = R.groupBy(
    ({ obj, row }) => R.head(obj.groups)?.id ?? row.resultGroupId,
    selectedChoices,
  );

  return R.chain(
    (row: ProjectRow): PackRow[] =>
      row.resultGroupId in choicesByGroup
        ? [{ packRow: row, choices: choicesByGroup[row.resultGroupId] ?? [] }]
        : [],
    backpack.value,
  );
});
const objectMode = computed(() => {
  if (lockBackpackObjects.value) return ViewContext.BackpackDisabled;
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

  .pack-row-title {
    font-size: 1.2rem;
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
