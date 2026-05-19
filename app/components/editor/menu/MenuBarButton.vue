<template>
  <Button
    :unstyled="true"
    class="p-1 flex flex-row items-center hover:bg-surface-800 rounded cursor-pointer border border-surface-800"
    @click="$emit('click', $event)"
  >
    <div class="size-6" :class="icon"></div>
  </Button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
}>();

defineEmits<{
  (e: 'click', evt: Event): void;
}>();
</script>

<style scoped lang="scss"></style>
