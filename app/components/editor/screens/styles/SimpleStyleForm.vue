<template>
  <div class="flex flex-col gap-4">
    <!-- Header Section -->
    <div v-if="style.header" class="flex flex-col gap-3">
      <h4 class="font-bold text-primary">Header</h4>

      <!-- Background -->
      <div v-if="style.header.background" class="grid grid-cols-form gap-2">
        <label class="font-bold">Background Color</label>
        <InputText v-model="style.header.background.color" fluid />
      </div>

      <div v-if="style.header.background" class="grid grid-cols-form gap-2">
        <label class="font-bold">Background Image</label>
        <InputText v-model="style.header.background.imageUrl" fluid />
      </div>

      <!-- Border -->
      <div v-if="style.header.border" class="flex flex-col gap-2">
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
      <div v-if="style.header.title" class="flex flex-col gap-2">
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
      <div v-if="style.header.text" class="flex flex-col gap-2">
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

    <!-- Contents Section -->
    <div class="flex flex-col gap-3">
      <h4 class="font-bold text-primary">Contents</h4>

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
  </div>
</template>

<script setup lang="ts">
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';

defineProps<{
  style: AnySimpleStyle;
}>();
</script>

<style scoped lang="scss"></style>
