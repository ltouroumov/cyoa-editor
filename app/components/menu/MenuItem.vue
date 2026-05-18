<template>
  <div
    class="flex flex-row items-center gap-2 p-2 rounded hover:bg-surface-800 cursor-pointer"
    @click="$emit('click', $event)"
  >
    <div v-if="icon" class="size-5" :class="icon"></div>
    <div class="grow"><slot /></div>
    <div v-if="iconEnd" class="size-5" :class="iconEnd"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon?: string; iconEnd?: string }>();

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>

<style scoped lang="scss"></style>
