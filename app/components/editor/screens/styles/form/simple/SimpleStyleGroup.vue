<template>
  <div class="flex flex-col gap-2">
    <div
      class="border-b border-surface-700 pb-1 mb-2 flex flex-row items-center"
    >
      <div class="font-bold text-primary grow">Background</div>
      <div v-if="canToggle" class="flex flex-row gap-2 items-center">
        <Checkbox v-model="isEnabled" binary />
        <label>{{ form.toggle?.label }}</label>
      </div>
    </div>
    <template v-if="isEnabled">
      <template v-for="entry in form.children" :key="entry.key">
        <SimpleStyleField
          :style="style"
          :form="entry"
          :parent="makeKey(parent, form.key)"
          @change="(field, value) => emit('change', field, value)"
          @disable="(field) => emit('disable', field)"
        />
      </template>
    </template>
    <div
      v-if="isEmpty(form.children) || !isEnabled"
      class="w-full lg:col-span-3"
    >
      <div
        class="bg-surface-800 text-surface-300 rounded p-4 min-h-32 flex items-center justify-center"
      >
        <div>Disabled</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty, isNotNil, path } from 'ramda';

import {
  type FormGroup,
  makeKey,
} from '~/components/editor/screens/styles/form/simple/forms';
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';

const props = defineProps<{
  style: AnySimpleStyle;
  form: FormGroup;
  parent?: string;
}>();

const emit = defineEmits<{
  change: [prop: string, value: any];
  disable: [field: string];
}>();

const canToggle = computed(() => isNotNil(props.form.toggle));

const groupValue = computed(() => {
  if (isNotNil(props.form.toggle)) {
    return path(props.form.toggle.prop, props.style);
  } else {
    return undefined;
  }
});

const isEnabled = computed({
  get: () => {
    if (!canToggle.value) {
      return true;
    } else {
      return isNotNil(groupValue.value);
    }
  },
  set: (value) => {
    const groupKey = makeKey(props.parent, props.form.key);
    if (!value) {
      emit('disable', groupKey);
    } else {
      emit('change', groupKey, props.form.toggle?.default ?? {});
    }
  },
});
</script>

<style scoped lang="scss"></style>
