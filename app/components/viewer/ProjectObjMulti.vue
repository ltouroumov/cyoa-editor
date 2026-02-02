<template>
  <div class="obj-select-multi">
    <div v-if="controlMode === 'slider'" class="w-1/2 sm:w-3/5 md:w-4/5 lg:w-3/5 px-2 mb-2">
      <div
        class="text-center font-bold"
        :class="{ 'cursor-pointer': canToggle, 'text-surface-400': !isSelected }"
        @click="canToggle && openPopover($event)"
      >
        {{ selectedValue }}
      </div>
      <Slider
        v-if="canToggle"
        v-model="sliderVal"
        :min="minValue"
        :max="maxValue"
        :step="1"
        class="w-full mt-1"
      />
    </div>
    <div v-else-if="controlMode === 'input'" class="w-4/5 lg:w-3/5 px-2 mb-1">
      <InputNumber
        v-if="canToggle"
        v-model="inputVal"
        :min="minValue"
        :max="maxValue"
        show-buttons
        button-layout="horizontal"
        class="w-full"
        input-class="w-full text-center py-1 px-0"
        decrement-button-class="p-button-secondary"
        increment-button-class="p-button-secondary"
        decrement-button-icon="pi pi-minus"
        increment-button-icon="pi pi-plus"
        :allow-empty="false"
      />
      <div v-else class="text-center font-bold" :class="{ 'text-surface-400': !isSelected }">
        {{ selectedValue }}
      </div>
      <div v-if="canToggle" class="flex justify-between text-xs text-surface-400 px-1 mt-1">
        <span>Min: {{ minValue }}</span>
        <span>Max: {{ maxValue }}</span>
      </div>
    </div>
    <div v-else class="contents">
      <div
        v-if="canToggle"
        class="pi pi-minus text-lg cursor-pointer"
        :class="{
          'text-green-400': selectedValue > minValue,
          'text-grey-400': selectedValue <= minValue,
        }"
        @click="decrement"
      />
      <span
        class="mx-4"
        :class="{ 'cursor-pointer': canToggle, 'text-surface-400': !isSelected }"
        @click="canToggle && openPopover($event)"
      >{{ selectedValue }}</span>
      <div
        v-if="canToggle"
        class="pi pi-plus text-lg cursor-pointer"
        :class="{
          'text-green-400': selectedValue < maxValue,
          'text-grey-400': selectedValue >= maxValue,
        }"
        @click="increment"
      />
    </div>
    <Popover ref="popover">
      <div class="flex flex-col gap-3 w-[225px]">
        <span class="text-surface-200 text-sm font-semibold">Set Value</span>
        <InputGroup>
          <InputNumber
            v-model="popValue"
            :min="minValue"
            :max="maxValue"
            show-buttons
            button-layout="horizontal"
            class="w-full"
            input-class="w-full text-center py-1 px-0 rounded-none ring-0 border-x-0"
            decrement-button-class="p-button-secondary rounded-r-none w-10 flex-none"
            increment-button-class="p-button-secondary rounded-r-none border-l-0 w-10 flex-none"
            decrement-button-icon="pi pi-minus"
            increment-button-icon="pi pi-plus"
            @keydown.enter="updateValue"
          />
          <InputGroupAddon class="!p-0 !min-w-0 !border-0 overflow-hidden flex-none">
            <Button
              icon="pi pi-check"
              class="rounded-l-none !border-l-0 w-10 border-y border-r border-surface-600 flex-none"
              severity="primary"
              @click="updateValue"
            />
          </InputGroupAddon>
        </InputGroup>
        <div class="flex justify-between text-xs text-surface-400 px-1">
          <span>Min: {{ minValue }}</span>
          <span>Max: {{ maxValue }}</span>
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import Popover from 'primevue/popover';

import type { ProjectObj } from '~/composables/project/types/v1';
import { useObject } from '~/composables/viewer/useObject';
import { useSettingRefs } from '~/composables/store/settings';

const { displaySettings } = useSettingRefs();

const $props = defineProps<{ obj: ProjectObj; canToggle?: boolean }>();
const {
  canToggle,
  isSelected,
  selectedValue,
  minValue,
  maxValue,
  setValue,
  increment,
  decrement,
} = useObject({
  obj: computed(() => $props.obj),
  canToggle: computed(() => $props.canToggle),
});

const controlMode = computed(() => {
  if (displaySettings.value.type === 'preset') return 'buttons';
  return displaySettings.value.settings?.multiSelectControl ?? 'buttons';
});

const sliderVal = computed({
  get: () => selectedValue.value,
  set: (val: number | number[]) => setValue(Array.isArray(val) ? val[0] : val),
});

const inputVal = computed({
  get: () => selectedValue.value,
  set: (val: number) => setValue(val),
});

const popover = ref<InstanceType<typeof Popover> | null>(null);
const popValue = ref<number>(0);

const openPopover = (event: Event) => {
  popValue.value = selectedValue.value;
  popover.value?.toggle(event);
};

const updateValue = () => {
  setValue(popValue.value);
  popover.value?.hide();
};

</script>

<style scoped lang="scss"></style>
