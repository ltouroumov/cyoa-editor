<script setup lang="ts">
defineEmits<{
  click: [];
}>();
</script>

<template>
  <button class="btn btn-sm btn-outline-secondary" @click="$emit('click')">
    <div class="d-flex align-items-center justify-content-center gap-1">
      <div class="d-inline-block i-solar:notes-bold h-1em w-1em"></div>
    </div>
  </button>
</template>

<style scoped lang="scss"></style>
