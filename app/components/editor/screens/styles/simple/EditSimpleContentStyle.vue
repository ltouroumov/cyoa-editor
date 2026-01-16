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
          v-model="style.contents.layout"
          :options="['list', 'grid']"
          fluid
        />
      </div>
      <div class="grid grid-cols-form gap-2">
        <label class="font-bold">Gap</label>
        <InputText v-model="style.contents.gap" fluid />
      </div>
    </div>

    <!-- Contents Margins -->
    <div v-if="style.contents.margins" class="flex flex-col gap-2">
      <div class="font-bold">Margins</div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div class="grid grid-cols-form gap-2">
          <label>Top</label>
          <InputText v-model="style.contents.margins.top" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Right</label>
          <InputText v-model="style.contents.margins.right" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Bottom</label>
          <InputText v-model="style.contents.margins.bottom" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Left</label>
          <InputText v-model="style.contents.margins.left" fluid />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

const props = defineProps<{
  styleId: string;
}>();

const style = computed((): AnySimpleStyle => {
  return projectStore.styles.rules[props.styleId] as AnySimpleStyle;
});
</script>

<style scoped lang="scss"></style>
