<script setup lang="ts">
const { stylesheet } = defineProps<{ stylesheet: string }>();
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html, vue/no-v-text-v-html-on-component -->
  <component :is="'style'" type="text/css" v-text="stylesheet" />
</template>
