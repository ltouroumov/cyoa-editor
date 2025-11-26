<template>
  <ul v-if="displaySettings.type === 'custom'" class="flex flex-col gap-0 mb-2">
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700 font-bold text-primary"
    >
      Row Settings
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideDisabledAddons"
        input-id="hideDisabledAddons"
        binary
      />
      <div class="flex flex-col gap-1">
        <label class="grow" for="hideDisabledAddons">
          Hide Disabled Addons
        </label>
      </div>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideRowImages"
        input-id="hideRowImages"
        binary
      />
      <label class="grow" for="hideRowImages"> Hide Row Images </label>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideRowText"
        input-id="hideRowText"
        binary
      />
      <label class="grow" for="hideRowText"> Hide Row Text </label>
    </li>

    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700 font-bold text-primary"
    >
      Choice Settings
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideObjectImages"
        input-id="hideObjectImages"
        binary
      />
      <label class="grow" for="hideObjectImages"> Hide Choice Images </label>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideObjectScores"
        input-id="hideObjectScores"
        binary
      />
      <label class="grow" for="hideObjectScores"> Hide Choice Scores </label>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideObjectRequirements"
        input-id="hideObjectRequirements"
        binary
      />
      <label class="grow" for="hideObjectRequirements">
        Hide Choice Requirements
      </label>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideObjectText"
        input-id="hideObjectText"
        binary
      />
      <label class="grow" for="hideObjectText"> Hide Choice Text </label>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <div
        class="w-[var(--p-checkbox-width)] h-[var(--p-checkbox-width)]"
      ></div>
      <label class="grow" for="hideObjectText"> Show Object Controls </label>
      <SelectButton
        v-model="displaySettings.settings.showObjectControls"
        input-id="showObjectControls"
        :options="[
          { label: 'Auto', value: 'auto' },
          { label: 'Always', value: 'always' },
          { label: 'Never', value: 'never' },
        ]"
        option-label="label"
        option-value="value"
        size="small"
      />
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.showObjectOverflow"
        input-id="showObjectOverflow"
        binary
      />
      <label class="grow" for="showObjectOverflow">
        Show Object Overflow
      </label>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.showObjectAddons"
        input-id="showObjectAddons"
        binary
      />
      <label class="grow" for="showObjectAddons"> Show Object Addons </label>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700 font-bold text-primary"
    >
      Addon Settings
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideAddonRequirements"
        input-id="hideAddonRequirements"
        binary
      />
      <label class="grow" for="hideAddonRequirements">
        Hide Addon Requirements
      </label>
    </li>
    <li
      class="flex flex-row items-center gap-2 py-2 border-b border-surface-700"
    >
      <Checkbox
        v-model="displaySettings.settings.hideAddonText"
        input-id="hideAddonText"
        binary
      />
      <label class="grow" for="hideAddonText"> Hide Addon Text </label>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useSettingRefs } from '~/composables/store/settings';

const { displaySettings } = useSettingRefs();
</script>

<style scoped lang="scss"></style>
