<template>
  <div class="choices-list">
    <template v-for="({ packRow, choices }, idx) in packRows" :key="packRow.id">
      <span v-if="idx > 0" class="spacer">|</span>
      <strong class="choice-group-title">{{ packRow.title }}:</strong>
      <span v-for="{ obj, count } in choices" :key="obj.id" class="choice-name">
        {{ obj.title }}
        <span v-if="obj.isSelectableMultiple" class="choice-count"
          >(x{{ count }})</span
        >
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { computed } from 'vue';

import { ProjectObj, ProjectRow } from '~/composables/project';
import {
  Selections,
  useProjectRefs,
  useProjectStore,
} from '~/composables/store/project';

const props = defineProps<{
  selected: Selections;
}>();

const { getObject, getObjectRow, getRow } = useProjectStore();
const { backpack } = useProjectRefs();

type PackRowChoice = { row: ProjectRow; obj: ProjectObj; count: number };
type PackRow = { packRow: ProjectRow; choices: PackRowChoice[] };
const packRows = computed(() => {
  const selectedChoices = R.map(
    ([id, count]): PackRowChoice => ({
      obj: getObject(id),
      row: getRow(getObjectRow(id)),
      count,
    }),
    R.toPairs(props.selected),
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
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

.choices-list {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.1rem;

  padding-top: 0.5rem;
  border-top: 1px solid var(--bs-border-color);

  .spacer {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
  }
}
</style>
