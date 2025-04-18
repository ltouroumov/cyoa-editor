<template>
  <div>
    <Button
      outlined
      severity="secondary"
      :label="width"
      pt:root:class="leading-none py-0 h-[2.0rem]"
      pt:icon:class="leading-none text-[1.5rem] h-[1.5rem]"
      @click="showLayoutPopover"
    />
    <Popover ref="choiceLayoutPopover" pt:content:class="min-w-[20rem]">
      <div class="flex flex-col gap-2 items-stretch">
        <div class="flex flex-row gap-2 justify-stretch">
          <SelectButton
            v-model="newWidthType"
            :options="WidthOptions"
            option-label="label"
            option-value="value"
            fluid
          />
          <Button label="Save" fluid @click="saveLayout" />
        </div>
        <IftaLabel>
          <Select
            v-model="newWidthValue"
            :options="GridItemWidths"
            option-label="label"
            option-value="value"
            :disabled="newWidthType !== 'override'"
            class="grow"
            fluid
          />
          <label>Item Width</label>
        </IftaLabel>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { assoc, find, isNil, omit } from 'ramda';

import { GridItemWidths } from '~/composables/editor/const';
import type { ChildObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

const props = defineProps<{
  choiceId: string;
  index: number;
}>();

const item = computed((): ChildObject => {
  const parentId = projectStore.getParent(props.choiceId)!;
  return projectStore.getChildren(parentId)[props.index];
});

const width = computed((): string => {
  const choiceWidth = item.value.layout?.width;
  if (isNil(choiceWidth)) {
    return 'auto';
  } else {
    return find((width) => width.value === choiceWidth, GridItemWidths)!.label;
  }
});

const parentWidth = computed((): number => {
  const parentId = projectStore.getParent(props.choiceId)!;
  return projectStore.get(parentId, ObjectType.row)!.layout.itemWidth;
});

const choiceLayoutPopover = ref();
const newWidthType = ref<string>('auto');
const newWidthValue = ref<number>(0);

function showLayoutPopover(event: any) {
  const choiceWidth = item.value.layout?.width;
  newWidthType.value = isNil(choiceWidth) ? 'auto' : 'override';
  newWidthValue.value = choiceWidth ?? parentWidth.value;

  choiceLayoutPopover.value.toggle(event);
}

function saveLayout() {
  if (newWidthType.value === 'auto') {
    item.value.layout = omit(['width'], item.value.layout ?? {});
  } else {
    item.value.layout = assoc(
      'width',
      newWidthValue.value,
      item.value.layout ?? {},
    );
  }

  choiceLayoutPopover.value.hide();
}

const WidthOptions = [
  {
    label: 'Auto',
    value: 'auto',
  },
  {
    label: 'Override',
    value: 'override',
  },
];
</script>

<style scoped lang="scss"></style>
