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
      <!-- Background -->
      <InputGroup>
        <InputGroupAddon>
          <Checkbox
            binary
            :value="isNotNil(style.header.background.color)"
            @change="
              $event.value ? (style.header.background.color = '#000') : null
            "
          />
        </InputGroupAddon>
        <IftaLabel>
          <label for="header-background-color">Background Color</label>
          <InputText
            v-model="style.header.background.color"
            input-id="header-background-color"
            fluid
          />
        </IftaLabel>
      </InputGroup>

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
      <div class="grid grid-cols-form gap-2 items-center">
        <label class="font-bold">Border Enabled</label>
        <ToggleSwitch v-model="style.header.border.enabled" />
      </div>
      <div
        v-if="style.header.border.enabled"
        class="grid grid-cols-1 md:grid-cols-2 gap-2"
      >
        <div class="grid grid-cols-form gap-2">
          <label class="font-bold">Style</label>
          <InputText v-model="style.header.border.style" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label class="font-bold">Width</label>
          <InputText v-model="style.header.border.width" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label class="font-bold">Color</label>
          <InputText v-model="style.header.border.color" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label class="font-bold">Radius</label>
          <InputText v-model="style.header.border.radius" fluid />
        </div>
      </div>
    </div>

    <!-- Title Text -->
    <div
      v-if="style.target === StyleTarget.choice && style.header.title"
      class="flex flex-col gap-2"
    >
      <div class="font-bold">Title Text</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="grid grid-cols-form gap-2">
          <label>Font Family</label>
          <InputText v-model="style.header.title.fontFamily" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Font Size</label>
          <InputText v-model="style.header.title.fontSize" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Text Color</label>
          <InputText v-model="style.header.title.textColor" fluid />
        </div>
      </div>
    </div>

    <!-- Body Text -->
    <div
      v-if="style.target === StyleTarget.choice && style.header.text"
      class="flex flex-col gap-2"
    >
      <div class="font-bold">Body Text</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="grid grid-cols-form gap-2">
          <label>Font Family</label>
          <InputText v-model="style.header.text.fontFamily" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Font Size</label>
          <InputText v-model="style.header.text.fontSize" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Text Color</label>
          <InputText v-model="style.header.text.textColor" fluid />
        </div>
      </div>
    </div>

    <!-- Margins -->
    <div v-if="style.header.margins" class="flex flex-col gap-2">
      <div class="font-bold">Margins</div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div class="grid grid-cols-form gap-2">
          <label>Top</label>
          <InputText v-model="style.header.margins.top" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Right</label>
          <InputText v-model="style.header.margins.right" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Bottom</label>
          <InputText v-model="style.header.margins.bottom" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Left</label>
          <InputText v-model="style.header.margins.left" fluid />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

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
