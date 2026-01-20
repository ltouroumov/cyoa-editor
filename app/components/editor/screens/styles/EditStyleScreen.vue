<template>
  <div class="flex flex-col gap-4">
    <!-- Basic Info -->
    <div class="flex flex-row gap-2">
      <IftaLabel class="grow">
        <label class="font-bold" for="styleName">Name</label>
        <InputText id="styleName" v-model="style.name" fluid />
      </IftaLabel>
      <IftaLabel>
        <label class="font-bold" for="styleTarget">Target</label>
        <InputText id="styleTarget" :value="style.target" disabled fluid />
      </IftaLabel>

      <IftaLabel>
        <label class="font-bold" for="styleType">Type</label>
        <InputText id="styleType" :value="style.type" disabled fluid />
      </IftaLabel>
    </div>

    <IftaLabel>
      <label class="font-bold" for="styleComment">Comment</label>
      <Textarea
        id="styleComment"
        v-model="style.comment"
        rows="3"
        fluid
        auto-resize
      />
    </IftaLabel>

    <!-- Style Type Specific Forms -->
    <div v-if="style.type === StyleType.simple" class="flex flex-col gap-4">
      <SimpleStyleForm v-model="style" />
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
