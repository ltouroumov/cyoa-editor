<template>
  <SideDrawer :visible="isBackpackVisible" side="right">
    <div class="pack-header bg-dark">
      <h5>Choices</h5>
      <button
        class="btn btn-dark i-solar-backpack-outline"
        @click="toggleBackpack()"
      />
    </div>
    <div class="pack-content bg-dark flex-grow-1">
      <div class="pack-scores">
        <ViewScoreStatus vertical />
      </div>
      <div v-for="row in activePackRows" :key="row.id" class="pack-row">
        <strong>{{ row.title }} ({{ row.resultGroupId }})</strong>
        <ul class="list-group list-group-flush">
          <li
            v-for="{ obj } in activePackRows[row.resultGroupId] ?? []"
            :key="obj.id"
            class="list-group-item choice"
          >
            {{ obj.title }}
          </li>
        </ul>
      </div>
    </div>
  </SideDrawer>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed, watch } from 'vue';

import { ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { getObject, getObjectRow, getRow } = useProjectStore();
const { selected, backpack } = useProjectRefs();
const { toggleBackpack } = useViewerStore();
const { isBackpackVisible } = useViewerRefs();

const activePackRows = computed(() => {
  return R.filter(
    (row: ProjectRow) => row.resultGroupId in choicesByGroup.value,
    backpack.value,
  );
});

const choicesByGroup = computed<Record<string, ProjectObj[]>>(() => {
  return R.groupBy(
    ({ row }) => row.resultGroupId,
    R.map(
      (id: string) => ({ obj: getObject(id), row: getRow(getObjectRow(id)) }),
      selected.value,
    ),
  );
});

watch(choicesByGroup, (newChoices) => {
  console.log('choices', newChoices);
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
    padding: 1em;
  }

  .pack-row {
    padding: 1em;
  }
}
</style>
