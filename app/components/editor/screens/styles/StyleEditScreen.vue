<template>
  <div class="flex flex-col gap-4">
    <!-- Basic Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div class="grid grid-cols-form gap-2 items-center">
        <label class="font-bold" for="styleName">Name</label>
        <InputText id="styleName" v-model="style.name" fluid />
      </div>
      <div class="grid grid-cols-form gap-2 items-center">
        <label class="font-bold" for="styleTarget">Target</label>
        <InputText id="styleTarget" :value="style.target" disabled fluid />
      </div>
    </div>

    <div class="grid grid-cols-form gap-2 items-start">
      <label class="font-bold" for="styleComment">Comment</label>
      <Textarea
        id="styleComment"
        v-model="style.comment"
        rows="3"
        fluid
        auto-resize
      />
    </div>

    <!-- Style Type Specific Forms -->
    <div v-if="style.type === StyleType.simple" class="flex flex-col gap-4">
      <h3 class="text-lg font-bold text-primary">Simple Style Configuration</h3>
      <SimpleStyleForm :style="style as AnySimpleStyle" />
    </div>

    <div
      v-else-if="style.type === StyleType.advanced"
      class="flex flex-col gap-4"
    >
      <h3 class="text-lg font-bold text-primary">Advanced Style</h3>
      <Message severity="info">
        <span class="font-bold">Work in Progress</span>
        <br />
        Advanced style editing is not yet implemented.
      </Message>
    </div>

    <div v-else-if="style.type === StyleType.css" class="flex flex-col gap-4">
      <h3 class="text-lg font-bold text-primary">CSS Style</h3>
      <Message severity="info">
        <span class="font-bold">Work in Progress</span>
        <br />
        CSS style editing is not yet implemented.
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';
import { StyleType } from '~/composables/project/types/v2/styles';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

const props = defineProps<{
  styleId: string;
}>();

const style = computed(() => {
  return projectStore.styles.rules[props.styleId];
});
</script>

<style scoped lang="scss"></style>
