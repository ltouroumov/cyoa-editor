<template>
  <div class="flex flex-col gap-4">
    <EditSimpleHeaderStyle v-model="style" />
    <EditSimpleContentStyle v-model="style" />
  </div>
</template>

<script setup lang="ts">
import type { AnyStyle } from '~/composables/project/types/v2/styles';

const style = defineModel<AnyStyle>({ required: true });
</script>

<style scoped lang="scss"></style>
