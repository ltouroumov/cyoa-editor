<template>
  <div v-if="isNotNil(model)" class="flex flex-col gap-2">
    <template v-for="entry in form.children" :key="entry.key">
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
import { assocPath, head, isEmpty, isNil, isNotNil, tail } from 'ramda';

import {
  type Form,
  type FormField,
  type FormGroup,
  type FormSection,
  SimpleStyleFormConfig,
} from '~/components/editor/screens/styles/form/simple/forms';
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';

const model = defineModel<AnySimpleStyle>();

const form = computed((): Form => {
  if (isNil(model.value)) return { label: 'Unknown', children: [] };
  return SimpleStyleFormConfig[model.value.target];
});

const onChange = (fieldKey: string, value: any) => {
  console.log('SimpleStyleForm onChange', fieldKey, value);
  const field = getField(fieldKey);
  if (field.type === 'group') {
    if (isNotNil(field.toggle)) {
      setAtPath(model.value, field.toggle.prop, value);
    } else {
      // do nothing
    }
  } else if (field.type === 'section') {
    // do nothing
  } else {
    setAtPath(model.value, field.prop, value);
  }
};

const onDisable = (fieldKey: string) => {
  const field = getField(fieldKey);
  if (field.type === 'group') {
    if (isNotNil(field.toggle)) {
      setAtPath(model.value, field.toggle.prop, undefined);
    } else {
      // do nothing
    }
  } else if (field.type === 'section') {
    // do nothing
  } else {
    setAtPath(model.value, field.prop, undefined);
  }
};

function setAtPath(model: any, path: string[], value: any) {
  const [head, ...tail] = path;
  if (tail.length > 0) {
    model[head] = assocPath(tail, value, model[head]);
  } else {
    model[head] = value;
  }
}

type FieldM = Form | FormSection | FormGroup;
type FieldT = FormField | FormGroup | FormSection;

function getField(fieldKey: string): FieldT {
  const find = (form: FieldM, path: string[]): FieldT | undefined => {
    if (isEmpty(path)) {
      return undefined;
    } else {
      const entry = form.children.find((item) => item.key === head(path));
      if (isNil(entry)) {
        return undefined;
      } else if (path.length === 1) {
        return entry;
      } else if (entry.type === 'group' || entry.type === 'section') {
        return find(entry, tail(path));
      } else {
        return undefined;
      }
    }
  };

  const parts = fieldKey.split('.');
  const field = find(form.value, parts);
  if (isNil(field)) {
    throw new Error(`Field not found: ${field}`);
  } else {
    return field;
  }
}
</script>

<style scoped lang="scss"></style>
