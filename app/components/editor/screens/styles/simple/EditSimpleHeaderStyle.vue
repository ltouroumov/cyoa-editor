<template>
  <!-- Header Section -->
  <div v-if="style.header" class="flex flex-col gap-3">
    <div class="border-b border-surface-700 pb-1 mb-2">
      <div class="text-xl font-bold text-primary">Header</div>
    </div>
    <div
      class="flex flex-col lg:flex-none lg:grid lg:grid-cols-3 lg:grid-rows-auto gap-3"
    >
      <div v-if="style.header.background" class="flex flex-col gap-2">
        <div class="border-b border-surface-700 pb-1 mb-2">
          <div class="font-bold text-primary">Background</div>
        </div>
        <OptionalInput
          v-model="style.header.background.color"
          default-value="#000000"
        >
          <template #default="{ disabled }">
            <IftaLabel>
              <InputText
                v-model="style.header.background.color"
                fluid
                :disabled="disabled"
              />
              <label>Background Color</label>
            </IftaLabel>
          </template>
          <template #addon>
            <ColorPicker v-model="style.header.background.color" />
          </template>
        </OptionalInput>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.background.imageUrl"
          default-value=""
        >
          <IftaLabel>
            <InputText
              v-model="style.header.background.imageUrl"
              fluid
              :disabled="disabled"
            />
            <label>Background Image</label>
          </IftaLabel>
        </OptionalInput>
      </div>

      <!-- Border -->
      <div
        v-if="style.target === StyleTarget.choice && style.header.border"
        class="flex flex-col gap-2"
      >
        <div
          class="border-b border-surface-700 pb-1 mb-2 flex flex-row items-center gap-2"
        >
          <div class="font-bold text-primary grow">Border</div>
          <div class="flex flex-row items-center gap-2">
            <Checkbox v-model="style.header.border.enabled" binary />
            <label>Border Enabled</label>
          </div>
        </div>

        <template v-if="style.header.border.enabled">
          <OptionalInput
            v-slot="{ disabled }"
            v-model="style.header.border.style"
            default-value="solid"
          >
            <IftaLabel>
              <InputText
                v-model="style.header.border.style"
                fluid
                :disabled="disabled"
              />
              <label>Style</label>
            </IftaLabel>
          </OptionalInput>
          <OptionalInput
            v-slot="{ disabled }"
            v-model="style.header.border.width"
            default-value="1px"
          >
            <IftaLabel>
              <InputText
                v-model="style.header.border.width"
                fluid
                :disabled="disabled"
              />
              <label>Width</label>
            </IftaLabel>
          </OptionalInput>
          <OptionalInput
            v-model="style.header.border.color"
            default-value="#000000"
          >
            <template #default="{ disabled }">
              <IftaLabel>
                <InputText
                  v-model="style.header.border.color"
                  fluid
                  :disabled="disabled"
                />
                <label>Color</label>
              </IftaLabel>
            </template>
            <template #addon>
              <ColorPicker v-model="style.header.border.color" />
            </template>
          </OptionalInput>
          <OptionalInput
            v-slot="{ disabled }"
            v-model="style.header.border.radius"
            default-value="0"
          >
            <IftaLabel>
              <InputText
                v-model="style.header.border.radius"
                fluid
                :disabled="disabled"
              />
              <label>Radius</label>
            </IftaLabel>
          </OptionalInput>
        </template>
      </div>

      <!-- Margins -->
      <div v-if="style.header.margins" class="flex flex-col gap-2">
        <div class="border-b border-surface-700 pb-1 mb-2">
          <div class="font-bold text-primary">Margins</div>
        </div>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.margins.top"
          default-value="0"
        >
          <IftaLabel>
            <InputText
              v-model="style.header.margins.top"
              fluid
              :disabled="disabled"
            />
            <label>Top</label>
          </IftaLabel>
        </OptionalInput>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.margins.right"
          default-value="0"
        >
          <IftaLabel>
            <InputText
              v-model="style.header.margins.right"
              fluid
              :disabled="disabled"
            />
            <label>Right</label>
          </IftaLabel>
        </OptionalInput>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.margins.bottom"
          default-value="0"
        >
          <IftaLabel>
            <InputText
              v-model="style.header.margins.bottom"
              fluid
              :disabled="disabled"
            />
            <label>Bottom</label>
          </IftaLabel>
        </OptionalInput>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.margins.left"
          default-value="0"
        >
          <IftaLabel>
            <InputText
              v-model="style.header.margins.left"
              fluid
              :disabled="disabled"
            />
            <label>Left</label>
          </IftaLabel>
        </OptionalInput>
      </div>

      <!-- Title Text -->
      <div
        v-if="style.target === StyleTarget.choice && style.header.title"
        class="flex flex-col gap-2"
      >
        <div class="border-b border-surface-700 pb-1 mb-2">
          <div class="font-bold text-primary">Title Text</div>
        </div>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.title.fontFamily"
          default-value=""
        >
          <IftaLabel>
            <InputText
              v-model="style.header.title.fontFamily"
              fluid
              :disabled="disabled"
            />
            <label>Font Family</label>
          </IftaLabel>
        </OptionalInput>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.title.fontSize"
          default-value="1rem"
        >
          <IftaLabel>
            <InputText
              v-model="style.header.title.fontSize"
              fluid
              :disabled="disabled"
            />
            <label>Font Size</label>
          </IftaLabel>
        </OptionalInput>
        <OptionalInput
          v-model="style.header.title.textColor"
          default-value="#000000"
        >
          <template #default="{ disabled }">
            <IftaLabel>
              <InputText
                v-model="style.header.title.textColor"
                fluid
                :disabled="disabled"
              />
              <label>Text Color</label>
            </IftaLabel>
          </template>
          <template #addon>
            <ColorPicker v-model="style.header.title.textColor" />
          </template>
        </OptionalInput>
      </div>

      <!-- Body Text -->
      <div
        v-if="style.target === StyleTarget.choice && style.header.text"
        class="flex flex-col gap-2"
      >
        <div class="border-b border-surface-700 pb-1 mb-2">
          <div class="font-bold text-primary">Body Text</div>
        </div>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.text.fontFamily"
          default-value=""
        >
          <IftaLabel>
            <InputText
              v-model="style.header.text.fontFamily"
              fluid
              :disabled="disabled"
            />
            <label>Font Family</label>
          </IftaLabel>
        </OptionalInput>
        <OptionalInput
          v-slot="{ disabled }"
          v-model="style.header.text.fontSize"
          default-value="1rem"
        >
          <IftaLabel>
            <InputText
              v-model="style.header.text.fontSize"
              fluid
              :disabled="disabled"
            />
            <label>Font Size</label>
          </IftaLabel>
        </OptionalInput>
        <OptionalInput
          v-model="style.header.text.textColor"
          default-value="#000000"
        >
          <template #default="{ disabled }">
            <IftaLabel>
              <InputText
                v-model="style.header.text.textColor"
                fluid
                :disabled="disabled"
              />
              <label>Text Color</label>
            </IftaLabel>
          </template>
          <template #addon>
            <ColorPicker v-model="style.header.text.textColor" />
          </template>
        </OptionalInput>
      </div>
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
