<template>
  <InputText
    v-model="model"
    :disabled="disabled ?? false"
    :pattern="pattern"
    :invalid="invalid"
  />
</template>

<script setup lang="ts">
const model = defineModel<string>();
defineProps<{
  disabled?: boolean;
  pattern?: string;
  invalid?: boolean;
}>();
</script>

<style scoped lang="scss"></style>
