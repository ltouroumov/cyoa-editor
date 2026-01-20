<template>
  <InputGroup>
    <InputGroupAddon>
      <Checkbox :model-value="isEnabled" binary @change="onEnabledChange" />
    </InputGroupAddon>
    <IftaLabel>
      <component
        :is="field.input.type"
        v-if="isNotNil(field)"
        v-bind="field.input.props"
        v-model="fieldValue"
        :disabled="!isEnabled"
      />
      <label :for="makeKey(parent, form.key)">{{ form.label }}</label>
    </IftaLabel>
    <InputGroupAddon v-if="field?.addon && isEnabled">
      <component
        :is="field.addon.type"
        v-bind="field.addon.props"
        v-model="fieldValue"
      />
    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import { isNotNil, path } from 'ramda';

import ColorField from '~/components/editor/screens/styles/form/simple/fields/ColorField.vue';
import ColorFieldAddon from '~/components/editor/screens/styles/form/simple/fields/ColorFieldAddon.vue';
import NumberField from '~/components/editor/screens/styles/form/simple/fields/NumberField.vue';
import StringField from '~/components/editor/screens/styles/form/simple/fields/StringField.vue';
import {
  type FormField,
  makeKey,
} from '~/components/editor/screens/styles/form/simple/forms';
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';

const props = defineProps<{
  style: AnySimpleStyle;
  form: FormField;
  parent: string;
}>();

const emit = defineEmits<{
  change: [field: string, value: any];
  disable: [field: string];
}>();

const isEnabled = computed<boolean>((): boolean => {
  return isNotNil(fieldValue.value);
});

const fieldValue = computed({
  get: (): any => {
    return path(props.form.prop, props.style);
  },
  set: (value: any) => {
    const fieldKey = makeKey(props.parent, props.form.key);
    emit('change', fieldKey, value);
  },
});

const onEnabledChange = (event: Event) => {
  if (!event.target || !(event.target instanceof HTMLInputElement)) return;
  const fieldKey = makeKey(props.parent, props.form.key);
  console.log('FormStyleField onEnabledChange', fieldKey, event);
  if (!event.target.checked) {
    emit('disable', fieldKey);
  } else {
    emit('change', fieldKey, props.form.default);
  }
};

type FieldComponent = {
  input: { type: any; props: any };
  addon?: { type: any; props: any };
};
const field = computed((): null | FieldComponent => {
  switch (props.form.type) {
    case 'string':
      return { input: { type: StringField, props: {} } };
    case 'number':
      return { input: { type: NumberField, props: {} } };
    case 'color':
      return {
        input: { type: ColorField, props: {} },
        addon: { type: ColorFieldAddon, props: {} },
      };
    default:
      return null;
  }
});
</script>

<style scoped lang="scss"></style>
