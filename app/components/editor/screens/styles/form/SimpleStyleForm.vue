<template>
  <div v-if="isNotNil(model)" class="flex flex-col gap-2">
    <template v-for="entry in form" :key="entry.key">
      <SimpleStyleSection
        v-if="entry.type === 'section'"
        :style="model"
        :form="entry"
        @change="onChange"
        @disable="onDisable"
      />
      <SimpleStyleGroup
        v-else-if="entry.type === 'group'"
        :style="model"
        :form="entry"
        @change="onChange"
        @disable="onDisable"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { isNil, isNotNil } from 'ramda';

import {
  type FormField,
  type FormGroup,
  type FormSection,
  SimpleStyleFormConfig,
} from '~/components/editor/screens/styles/form/simple/forms';
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';

const model = defineModel<AnySimpleStyle>();

const form = computed(() => {
  if (isNil(model.value)) return [];
  return SimpleStyleFormConfig[model.value.target];
});

const onChange = (field: string, value: any) => {
  console.log('SimpleStyleForm onChange', field, value);
};

const onDisable = (fieldKey: string) => {
  console.log('SimpleStyleForm onDisable', fieldKey);
  const field = getField(fieldKey);
  console.log('SimpleStyleForm onDisable', field);
};

function getField(field: string) {
  const parts = field.split('.');
  let cur: (FormSection | FormGroup | FormField)[] = form.value;
  for (const part of parts) {
    const entry = cur.find((item) => item.key === part);
    if (!entry) throw new Error(`No field at '${field}'`);

    if (entry.type === 'section') {
      cur = entry.children;
    } else if (entry.type === 'group') {
      cur = entry.children;
    } else {
      return entry;
    }
  }
}
</script>

<style scoped lang="scss"></style>
