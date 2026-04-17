<template>
  <div v-if="row.styles" class="flex flex-col gap-2 grow">
    <div class="flex flex-col gap-2">
      <div
        v-for="(style, idx) in rowStyles"
        :key="style.id"
        class="flex flex-row gap-2 items-center"
      >
        <InputGroup>
          <InputGroupAddon>
            <IconButton
              severity="secondary"
              variant="text"
              icon="iconify solar--arrow-up-linear"
              class="shrink-0 h-full"
              :disabled="idx === 0"
              @click="doMoveUp(style.id)"
            />
          </InputGroupAddon>
          <InputGroupAddon>
            <IconButton
              severity="secondary"
              variant="text"
              icon="iconify solar--arrow-down-linear"
              class="shrink-0 h-full"
              :disabled="idx === rowStyles.length - 1"
              @click="doMoveDown(style.id)"
            />
          </InputGroupAddon>
          <div
            class="flex flex-row gap-1 grow p-component p-inputtext overflow-x-clip"
          >
            <div class="w-max">{{ style.name }}</div>
            <div class="w-max text-slate-500 font-mono">
              [id: {{ style.id }}]
            </div>
          </div>
          <InputGroupAddon>
            <IconButton
              severity="secondary"
              variant="text"
              icon="iconify solar--trash-bin-minimalistic-linear"
              class="shrink-0 h-full"
              @click="doRemoveStyle(style.id)"
            />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
    <div class="flex flex-row gap-1 items-center">
      <InputGroup>
        <Select
          v-model="addStyleId"
          option-label="name"
          option-value="id"
          :options="StylesList"
        />
        <InputGroupAddon>
          <IconButton
            severity="secondary"
            variant="text"
            icon="iconify solar--add-circle-linear"
            class="shrink-0 h-full"
            @click="doAddStyle()"
          />
        </InputGroupAddon>
      </InputGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { append, equals, indexOf, reject, swap, uniq } from 'ramda';

import type { RowObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { StyleTarget } from '~/composables/project/types/v2/styles';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  rowId: string;
}>();

const row = computed((): RowObject => {
  return projectStore.get(props.rowId, ObjectType.row)!;
});

const rowStyles = computed(() => {
  return (row.value.styles ?? []).map((styleId) => {
    return projectStore.styles.rules[styleId];
  });
});
const addStyleId = ref();

const StylesList = computed(() => {
  return Object.values(projectStore.styles.rules).filter(
    (style) => style.target === StyleTarget.row,
  );
});

const doAddStyle = () => {
  if (!addStyleId.value) return;
  row.value.styles = uniq(append(addStyleId.value, row.value.styles ?? []));
  addStyleId.value = undefined;
};

const doRemoveStyle = (styleId: string) => {
  row.value.styles = reject(equals(styleId), row.value.styles ?? []);
};

const doMoveUp = (styleId: string) => {
  const idx = indexOf(styleId, row.value.styles ?? []);
  // not found or at the first position
  if (idx === -1 || idx === 0) return;
  row.value.styles = swap(idx, idx - 1, row.value.styles ?? []);
};
const doMoveDown = (styleId: string) => {
  const idx = indexOf(styleId, row.value.styles ?? []);
  // not found or at the last position
  if (idx === -1 || idx === (row.value.styles ?? []).length - 1) return;
  row.value.styles = swap(idx, idx + 1, row.value.styles ?? []);
};
</script>

<style scoped lang="scss"></style>
