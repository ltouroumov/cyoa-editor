<template>
  <div class="flex flex-col gap-3">
    <div class="border-b border-surface-700 pb-1 mb-2">
      <div class="text-xl font-bold text-primary">{{ form.label }}</div>
    </div>
    <div
      class="flex flex-col lg:flex-none lg:grid lg:grid-cols-3 lg:grid-rows-auto gap-3"
    >
      <template
        v-for="entry in form.children"
        :key="makeKey(form.key, entry.key)"
      >
        <SimpleStyleGroup
          v-if="entry.type === 'group'"
          :style="style"
          :form="entry"
          :parent="form.key"
          @change="(field, value) => emit('change', field, value)"
          @disable="(field) => emit('disable', field)"
        />
        <div v-else>{{ entry.label }}</div>
      </template>
      <div v-if="isEmpty(form.children)" class="w-full lg:col-span-3">
        <div
          class="bg-surface-800 text-surface-300 rounded p-4 min-h-32 flex items-center justify-center"
        >
          <div>No Fields</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from 'ramda';

import {
  type FormSection,
  makeKey,
} from '~/components/editor/screens/styles/form/simple/forms';
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';

defineProps<{
  style: AnySimpleStyle;
  form: FormSection;
}>();

const emit = defineEmits<{
  change: [field: string, value: any];
  disable: [field: string];
}>();
</script>

<style scoped lang="scss"></style>
