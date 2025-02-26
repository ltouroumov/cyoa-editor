<template>
  <div class="flex flex-row gap-2">
    <ButtonGroup>
      <IconButton
        outlined
        severity="secondary"
        icon="iconify solar--arrow-up-line-duotone"
        @click="moveUp()"
      />
      <Button
        outlined
        severity="secondary"
        :label="toString(index)"
        pt:root:class="leading-none p-0 w-[2.5rem] h-[2.0rem]"
        pt:icon:class="leading-none text-[1.5rem] w-[1.5rem] h-[1.5rem]"
        @click="showMoveIndex"
      />
      <IconButton
        outlined
        severity="secondary"
        icon="iconify solar--arrow-down-line-duotone"
        @click="moveDown()"
      />
    </ButtonGroup>
    <Popover ref="indexShiftPopover">
      <div class="flex flex-col gap-2">
        <span class="text-surface-500 text-sm">Move to position</span>
        <InputGroup>
          <InputNumber v-model="newPosition" show-buttons />
          <InputGroupAddon>
            <Button
              severity="secondary"
              icon="iconify solar--round-double-alt-arrow-right-line-duotone"
              @click="moveIndex()"
            />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { toString } from 'ramda';

import { useEditorStore } from '~/composables/editor/useEditorStore';
import { useProjectMoveUtils } from '~/composables/project/useProjectMoveUtils';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();
const { moveRelative, moveAbsolute } = useProjectMoveUtils();

const props = defineProps<{
  rowId: string;
  index: number;
}>();

const indexShiftPopover = ref();
const newPosition = ref<number>(0);

function showMoveIndex(event: any) {
  newPosition.value = props.index;
  indexShiftPopover.value.toggle(event);
}

function moveUp() {
  moveRelative(props.rowId, -1);
}

function moveDown() {
  moveRelative(props.rowId, +1);
}

function moveIndex() {
  moveAbsolute(props.rowId, newPosition.value);
  indexShiftPopover.value.hide();
}
</script>

<style scoped lang="scss"></style>
