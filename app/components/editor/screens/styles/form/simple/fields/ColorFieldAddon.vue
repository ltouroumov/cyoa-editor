<template>
  <ColorPicker v-model="model" :disabled="disabled ?? false" format="hex" />
</template>

<script setup lang="ts">
const model = defineModel<string>();
defineProps<{ disabled?: boolean }>();
</script>

<style scoped lang="scss"></style>
