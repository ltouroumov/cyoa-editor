<template>
  <div
    class="drawer-base"
    :class="{ hidden: !visible }"
    @click="$emit('close')"
  >
    <div class="drawer-container" :class="[`side-${side ?? 'left'}`]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { visible, side } = defineProps<{
  visible: boolean;
  side: 'top' | 'right' | 'bottom' | 'left';
}>();

defineEmits<{ (e: 'close'): void }>();
</script>

<style lang="scss">
.drawer-base {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;

  background: rgba(50, 50, 50, 0.5);

  &.hidden {
    display: none;
  }

  .drawer-container {
    position: fixed;

    min-width: 25vw;
    min-height: 25vh;

    display: flex;
    flex-direction: column;

    &.side-left {
      top: 0;
      left: 0;
      bottom: 0;
    }

    &.side-right {
      top: 0;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
