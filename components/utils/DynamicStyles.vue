<script setup lang="ts">
const { stylesheet } = defineProps<{ stylesheet: string }>();
</script>

<template>
  <component :is="'style'" v-html="stylesheet" />
</template>
