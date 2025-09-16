<template>
  <div
    v-if="isVisible"
    class="collection-loader"
    :class="{ loading: isLoading }"
  >
    <div v-show="!isLoading" class="items-container">
      <component :is="wrapper?.tag ?? 'div'" v-bind="wrapper?.props ?? {}">
        <slot v-for="item in visible" name="item" v-bind="{ item }" />
      </component>
    </div>
    <div v-if="isLoading" class="loader-container">
      <slot name="loader">
        <div class="flex flex-col items-stretch">
          <Skeleton width="100%" height="300px" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { concat, length, slice } from 'ramda';

const $props = defineProps<{
  items: any[];
  isVisible: boolean;
  step: number;
  wrapper?: { tag: string; props: any };
}>();

const visible = ref<any[]>([]);
const index = ref<number>(0);

const isCompleted = computed(() => index.value >= length($props.items));
const isLoading = computed(() => !isCompleted.value || !$timeout.ready.value);

const addVisible = () => {
  const curIndex = index.value;
  if (curIndex < length($props.items)) {
    const itemSlice = slice(curIndex, curIndex + $props.step, $props.items);
    visible.value = concat(visible.value, itemSlice);
    index.value += length(itemSlice);
  } else {
    $interval.pause();
  }
};

const $timeout = useTimeout(500, {
  controls: true,
  immediate: $props.isVisible,
});
const $interval = useIntervalFn(addVisible, 100, {
  immediate: $props.isVisible,
});

watch(
  () => $props.isVisible,
  (newVal) => {
    if (newVal && !isCompleted.value) {
      $interval.resume();
      $timeout.start();
    } else {
      $interval.pause();
      $timeout.stop();
    }
  },
);
</script>

<style scoped lang="scss"></style>
