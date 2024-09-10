<template>
  <div
    class="offcanvas"
    :class="[{ show: props.show, hiding: !props.show }, positionClass]"
    v-bind="$attrs"
  >
    <div v-if="props.header ?? true" class="offcanvas-header">
      <slot name="header" />
      <button
        v-if="props.closeButton ?? true"
        type="button"
        class="btn-close text-reset"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
        @click="$emit('close')"
      ></button>
    </div>
    <div class="offcanvas-body">
      <slot />
    </div>
  </div>
  <div
    v-if="show"
    class="offcanvas-backdrop fade show"
    @click="$emit('close')"
  ></div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'close'): void;
}>();

const POSITIONS = {
  start: 'offcanvas-start',
  end: 'offcanvas-end',
  left: 'offcanvas-start',
  right: 'offcanvas-end',
  top: 'offcanvas-top',
  bottom: 'offcanvas-bottom',
} as const;

const props = defineProps<{
  show: boolean;
  position: keyof typeof POSITIONS;
  closeButton?: boolean;
  header?: boolean;
}>();

const positionClass = computed(() => {
  return POSITIONS[props.position];
});
</script>

<style scoped></style>
