<template>
  <!-- Contents Section -->
  <div class="flex flex-col gap-3">
    <div class="border-b border-surface-700 pb-1 mb-2">
      <div class="text-xl font-bold text-primary">Content</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div class="grid grid-cols-form gap-2">
        <label class="font-bold">Layout</label>
        <Select
          v-model="simpleStyle.contents.layout"
          :options="['list', 'grid']"
          fluid
        />
      </div>
      <div class="grid grid-cols-form gap-2">
        <label class="font-bold">Gap</label>
        <InputText v-model="simpleStyle.contents.gap" fluid />
      </div>
    </div>

    <!-- Contents Margins -->
    <div v-if="simpleStyle.contents.margins" class="flex flex-col gap-2">
      <div class="font-bold">Margins</div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div class="grid grid-cols-form gap-2">
          <label>Top</label>
          <InputText v-model="simpleStyle.contents.margins.top" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Right</label>
          <InputText v-model="simpleStyle.contents.margins.right" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Bottom</label>
          <InputText v-model="simpleStyle.contents.margins.bottom" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Left</label>
          <InputText v-model="simpleStyle.contents.margins.left" fluid />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  AnySimpleStyle,
  AnyStyle,
} from '~/composables/project/types/v2/styles';

const style = defineModel<AnyStyle>({ required: true });
const simpleStyle = computed(
  (): AnySimpleStyle => style.value as AnySimpleStyle,
);
</script>

<style scoped lang="scss"></style>
