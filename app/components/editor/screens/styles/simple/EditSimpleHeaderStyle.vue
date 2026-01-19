<template>
  <!-- Header Section -->
  <div v-if="style.header" class="flex flex-col gap-3">
    <div class="border-b border-surface-700 pb-1 mb-2">
      <div class="text-xl font-bold text-primary">Header</div>
    </div>

    <div v-if="style.header.background" class="flex flex-col gap-2">
      <div class="border-b border-surface-700 pb-1 mb-2">
        <div class="font-bold text-primary">Background</div>
      </div>
      <IftaLabel>
        <label>Background Color</label>
        <InputText v-model="style.header.background.color" fluid />
      </IftaLabel>
      <IftaLabel>
        <label>Background Image</label>
        <InputText v-model="style.header.background.imageUrl" fluid />
      </IftaLabel>
    </div>

    <!-- Border -->
    <div
      v-if="style.target === StyleTarget.choice && style.header.border"
      class="flex flex-col gap-2"
    >
      <div class="border-b border-surface-700 pb-1 mb-2">
        <div class="font-bold text-primary">Border</div>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Checkbox v-model="style.header.border.enabled" />
        <label>Border Enabled</label>
      </div>
      <template v-if="style.header.border.enabled">
        <IftaLabel>
          <label>Style</label>
          <InputText v-model="style.header.border.style" fluid />
        </IftaLabel>
        <IftaLabel>
          <label>Width</label>
          <InputText v-model="style.header.border.width" fluid />
        </IftaLabel>
        <IftaLabel>
          <label>Color</label>
          <InputText v-model="style.header.border.color" fluid />
        </IftaLabel>
        <IftaLabel>
          <label>Radius</label>
          <InputText v-model="style.header.border.radius" fluid />
        </IftaLabel>
      </template>
    </div>

    <!-- Title Text -->
    <div
      v-if="style.target === StyleTarget.choice && style.header.title"
      class="flex flex-col gap-2"
    >
      <div class="border-b border-surface-700 pb-1 mb-2">
        <div class="font-bold text-primary">Title Text</div>
      </div>
      <IftaLabel>
        <label>Font Family</label>
        <InputText v-model="style.header.title.fontFamily" fluid />
      </IftaLabel>
      <IftaLabel>
        <label>Font Size</label>
        <InputText v-model="style.header.title.fontSize" fluid />
      </IftaLabel>
      <IftaLabel>
        <label>Text Color</label>
        <InputText v-model="style.header.title.textColor" fluid />
      </IftaLabel>
    </div>

    <!-- Body Text -->
    <div
      v-if="style.target === StyleTarget.choice && style.header.text"
      class="flex flex-col gap-2"
    >
      <div class="border-b border-surface-700 pb-1 mb-2">
        <div class="font-bold text-primary">Body Text</div>
      </div>
      <IftaLabel>
        <label>Font Family</label>
        <InputText v-model="style.header.text.fontFamily" fluid />
      </IftaLabel>
      <IftaLabel>
        <label>Font Size</label>
        <InputText v-model="style.header.text.fontSize" fluid />
      </IftaLabel>
      <IftaLabel>
        <label>Text Color</label>
        <InputText v-model="style.header.text.textColor" fluid />
      </IftaLabel>
    </div>

    <!-- Margins -->
    <div v-if="style.header.margins" class="flex flex-col gap-2">
      <div class="border-b border-surface-700 pb-1 mb-2">
        <div class="font-bold text-primary">Margins</div>
      </div>
      <IftaLabel>
        <label>Top</label>
        <InputText v-model="style.header.margins.top" fluid />
      </IftaLabel>
      <IftaLabel>
        <label>Right</label>
        <InputText v-model="style.header.margins.right" fluid />
      </IftaLabel>
      <IftaLabel>
        <label>Bottom</label>
        <InputText v-model="style.header.margins.bottom" fluid />
      </IftaLabel>
      <IftaLabel>
        <label>Left</label>
        <InputText v-model="style.header.margins.left" fluid />
      </IftaLabel>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  type AnySimpleStyle,
  StyleTarget,
} from '~/composables/project/types/v2/styles';
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
