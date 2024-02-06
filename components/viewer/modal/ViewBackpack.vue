<template>
  <ModalDialog :show="isBackpackVisible" @close="toggleBackpack(false)">
    <template #header>
      <h5 class="m-0">Choices</h5>
    </template>
    <template #default>
      <div class="pack-content bg-dark flex-grow-1">
        <div class="pack-scores">
          <ViewScoreStatus vertical />
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
                :can-toggle="false"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import ModalDialog from '~/components/utils/ModalDialog.vue';
import { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { getObject, getObjectRow, getRow } = useProjectStore();
const { selected, selectedIds, backpack } = useProjectRefs();
const { toggleBackpack } = useViewerStore();
const { isBackpackVisible } = useViewerRefs();

const packRows = computed(() => {
  const selectedChoices = R.map(
    (id: string) => ({ obj: getObject(id), row: getRow(getObjectRow(id)) }),
    selectedIds.value,
  );
  const choicesByGroup: Partial<
    Record<string, { obj: ProjectObj; row: ProjectRow }[]>
  > = R.groupBy(({ row }) => row.resultGroupId, selectedChoices);

  return R.chain(
    (row: ProjectRow) =>
      row.resultGroupId in choicesByGroup
        ? [{ packRow: row, choices: choicesByGroup[row.resultGroupId] }]
        : [],
    backpack.value,
  );
});
</script>

<style lang="scss">
.pack-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em;
}

.pack-content {
  overflow: auto;

  .pack-scores {
    margin-bottom: 0.5rem;
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
}
</style>
