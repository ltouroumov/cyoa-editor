<template>
  <InputText v-model="model" :disabled="disabled ?? false" />
</template>

<script setup lang="ts">
const model = defineModel<string>();
defineProps<{ disabled?: boolean }>();
</script>

<style scoped lang="scss"></style>
