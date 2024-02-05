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
          v-for="{ row, choices } in packRows"
          :key="row.id"
          class="pack-row"
        >
          <strong class="pack-row-title">
            {{ row.title }}
          </strong>
          <ul class="list-group list-group-flush">
            <li
              v-for="{ obj } in choices"
              :key="obj.id"
              class="list-group-item choice"
            >
              {{ obj.title }}
              <template v-if="obj.isSelectableMultiple">
                (×{{ selected[obj.id] }})
              </template>
            </li>
          </ul>
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
        ? [{ row, choices: choicesByGroup[row.resultGroupId] }]
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

    .pack-row-title {
      font-size: 1.1rem;
    }

    .choice {
      padding-left: 0;
      padding-right: 0;
    }
  }
}
</style>
