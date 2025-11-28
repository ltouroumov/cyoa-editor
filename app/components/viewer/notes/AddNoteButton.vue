<script setup lang="ts">
defineEmits<{
  click: [];
}>();
</script>

<template>
  <Button variant="outlined" severity="secondary" @click="$emit('click')">
    <div class="iconify solar--notes-bold h-1em w-1em"></div>
  </Button>
</template>

<style scoped lang="scss"></style>
