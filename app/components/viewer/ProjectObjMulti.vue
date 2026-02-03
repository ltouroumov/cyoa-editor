<template>
  <div class="obj-select-multi">
    <div class="flex flex-row w-full mx-2 px-2 py-0 relative">
      <div class="flex flex-row items-stretch gap-1 grow relative z-10">
        <div
          v-if="canToggle"
          class="btn-decrement"
          :class="{
            'text-green-400': selectedAmount > minSelectedAmount,
            'text-gray-400': selectedAmount <= minSelectedAmount,
          }"
          @click="decrement"
        >
          <i class="pi pi-minus" />
        </div>
        <div
          v-if="mode === 'show'"
          class="grow flex flex-row gap-2 items-center relative"
          @click.stop.prevent="mode = 'edit'"
        >
          <span class="grow text-center">{{ selectedAmount }}</span>
        </div>
        <div v-if="mode === 'edit'" class="grow flex flex-row gap-1 relative">
          <input
            type="text"
            v-model="amountInput"
            class="w-full focus:outline-none text-center"
          />
          <div
            class="absolute right-0 top-0 bottom-0 flex flex-row justify-center items-center"
          >
            <div
              class="pi pi-check size-5 my-2 text-gray-200 shrink-0 cursor-pointer"
              @click="mode = 'show'"
            />
          </div>
        </div>
        <div
          v-if="canToggle"
          class="btn-increment"
          :class="{
            'text-green-400': selectedAmount < maxSelectedAmount,
            'text-gray-400': selectedAmount >= minSelectedAmount,
          }"
          @click="increment"
        >
          <i class="pi pi-plus" />
        </div>
      </div>
      <div
        v-if="mode === 'edit'"
        class="absolute right-0 left-0 top-0 pt-10 flex flex-col px-2 py-1 p-inputtext z-5"
      >
        <div class="h-6 flex flex-row items-center px-2">
          <Slider
            class="w-full"
            v-model="selectedAmount"
            :min="minSelectedAmount"
            :max="maxSelectedAmount"
          />
        </div>
        <div class="flex flex-row justify-between items-center">
          <span>min: {{ minSelectedAmount }}</span>
          <span>max: {{ maxSelectedAmount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectObj } from '~/composables/project/types/v1';
import { useObject } from '~/composables/viewer/useObject';

const $props = defineProps<{ obj: ProjectObj; canToggle?: boolean }>();
const {
  canToggle,
  selectedAmount,
  minSelectedAmount,
  maxSelectedAmount,
  increment,
  decrement,
} = useObject({
  obj: computed(() => $props.obj),
  canToggle: computed(() => $props.canToggle),
});

const mode = ref<'show' | 'edit'>('show');
const amountInput = computed({
  get: () => `${selectedAmount.value}`,
  set: (newValue) => {
    selectedAmount.value = parseInt(newValue, 10);
  },
});
</script>

<style scoped lang="scss">
@reference "#main.css";

.btn-increment,
.btn-decrement {
  @apply size-6 cursor-pointer shrink-0 my-2 rounded-full flex flex-row justify-center items-center;

  & > i.pi {
    font-size: 1.1rem;
  }
}
</style>
