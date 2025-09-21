<template>
  <div
    class="project-obj obj-parents w-full lg:w-[60rem] h-full overflow-auto flex flex-col pt-4 relative"
  >
    <div
      class="w-full flex flex-row items-center justify-between border-b border-surface-500 gap-2 px-4 mb-4 pb-4"
    >
      <div class="text-xl text-primary">Parents of {{ obj.title }}</div>
      <div class="flex flex-row items-center mr-10">
        <ToggleSwitch v-model="expand" class="mr-2" />
        <label class="text-surface-500">Expand Objects</label>
      </div>
    </div>
    <div class="w-full px-4 pb-4 flex flex-col gap-4 overflow-auto">
      <div
        v-for="(layer, idx) in parents"
        :key="layer.depth"
        :class="{ 'border-t border-surface-500 pt-4': idx > 0 }"
      >
        <div v-if="!expand" class="w-full flex flex-col gap-2">
          <ParentObj
            v-for="{ obj } in layer.entries"
            :key="obj.id"
            :obj="obj"
          />
        </div>
        <div v-if="expand" class="w-full row g-2">
          <ViewProjectObj
            v-for="{ obj, row } in layer.entries"
            :key="obj.id"
            :obj="obj"
            :row="row"
            :view-object="ViewContext.Viewer"
            template="1"
            force-width="col-4"
            :allow-overflow="false"
            :show-addons="false"
            :display="{ showObjectControls: 'never' }"
          />
        </div>
      </div>
    </div>
    <slot name="right" />
  </div>
</template>

<script setup lang="ts">
import { chain } from 'ramda';
import * as R from 'ramda';
import { P, match } from 'ts-pattern';

import ParentObj from '~/components/viewer/parents/ParentObj.vue';
import type {
  ConditionTerm,
  HasRequirements,
  ProjectObj,
  ProjectRow,
} from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

/*  */

const store = useProjectStore();
const { selectedIds, selected } = useProjectRefs();

const $props = defineProps<{
  row: ProjectRow;
  obj: ProjectObj;
}>();

type Layer = { depth: number; entries: LayerEntry[] };
type LayerEntry = { obj: ProjectObj; row: ProjectRow };

const expand = ref<boolean>(false);
const parents = computed(() => {
  const layers: Layer[] = [];
  const stack = [{ depth: 0, data: $props.obj }];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const { depth, data } = stack.pop()!;

    // create a new layer if needed
    while (layers.length <= depth) {
      layers.push({ depth: layers.length, entries: [] });
    }
    // push the object to the current layer
    const rowId = store.getObjectRow(data.id);
    const row = store.getRow(rowId);
    layers[depth].entries.push({ obj: data, row: row });

    // enqueue the dependencies
    const deps = collectRequirements(data);
    for (const depId of deps) {
      const depObj = store.getObject(depId);
      if (depObj && !visited.has(depObj.id)) {
        visited.add(depObj.id);
        stack.push({ depth: depth + 1, data: depObj });
      }
    }
  }

  return layers;
});

function collectRequirements(obj: HasRequirements): string[] {
  function _collect(term: ConditionTerm): string[] {
    // do not collect hidden requirements
    if (!term.showRequired) return [];

    return match(term)
      .with({ type: 'id', required: true }, () => {
        return R.reject(R.isEmpty, [
          term.reqId,
          term.reqId1,
          term.reqId2,
          term.reqId3,
        ]);
      })
      .with({ type: 'id', required: false }, () => {
        return R.reject(R.isEmpty, [
          term.reqId,
          term.reqId1,
          term.reqId2,
          term.reqId3,
        ]);
      })
      .with(
        { type: 'or', required: true, orRequired: P.select() },
        (orRequired) => {
          return R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
        },
      )
      .with(
        { type: 'or', required: false, orRequired: P.select() },
        (orRequired) => {
          return R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
        },
      )
      .otherwise(() => []);
  }

  return chain(_collect, obj.requireds);
}
</script>

<style scoped lang="scss">
.project-obj.obj-parents {
  background-color: var(--obj-bg-color);
  border: var(--obj-border);
  border-radius: var(--obj-border-radius);
}
</style>
