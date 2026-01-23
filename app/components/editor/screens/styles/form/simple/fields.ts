import { has, isNotNil, pick, prop } from 'ramda';

import ColorFieldAddon from '~/components/editor/screens/styles/form/simple/fields/ColorFieldAddon.vue';
import NumberField from '~/components/editor/screens/styles/form/simple/fields/NumberField.vue';
import StringField from '~/components/editor/screens/styles/form/simple/fields/StringField.vue';
import type { FormField } from '~/components/editor/screens/styles/form/simple/forms';

type FieldComponentDef = { type: any; props?: any };
type FieldComponent = {
  input: FieldComponentDef | any;
  addon?: FieldComponentDef | any;
};
type FieldMapper = {
  // transform style data to fields
  toInput?: (value: any) => any;
  toAddon?: (value: any) => any;
  // transform fields to style data
  onInput?: (value: any) => any;
  onAddon?: (value: any) => any;
  // data validation
  validate?: (value: any) => boolean;
};

const FieldComponentMap: Record<string, FieldComponent & FieldMapper> = {
  string: { input: { type: StringField } },
  number: { input: { type: NumberField } },
  color: {
    input: { type: StringField },
    addon: { type: ColorFieldAddon },
    onAddon: (value: string): string => `#${value}`,
    validate: (value: string): boolean => {
      const isValid = /^#[0-9a-fA-F]{6}$/.test(value);
      console.log('Validating color:', value, 'Result:', isValid);
      return isValid;
    },
  },
};

export function useField(form: Ref<FormField>, value: Ref) {
  const fieldData = computed(() => {
    const fieldType: string = form.value.type;
    if (has(fieldType, FieldComponentMap)) {
      return prop(fieldType, FieldComponentMap);
    } else {
      return null;
    }
  });

  const fieldComponent = computed((): null | FieldComponent => {
    return isNotNil(fieldData.value)
      ? pick(['input', 'addon'], fieldData.value)
      : null;
  });

  const fieldValue = computed({
    get: (): any => {
      const { toInput } = fieldData.value ?? {};
      return isNotNil(toInput) ? toInput(value.value) : value.value;
    },
    set: (newValue: any) => {
      const { onInput } = fieldData.value ?? {};
      value.value = isNotNil(onInput) ? onInput(newValue) : newValue;
    },
  });

  const addonValue = computed({
    get: (): any => {
      const { toAddon } = fieldData.value ?? {};
      return isNotNil(toAddon) ? toAddon(value.value) : value.value;
    },
    set: (newValue: any) => {
      const { onAddon } = fieldData.value ?? {};
      value.value = isNotNil(onAddon) ? onAddon(newValue) : newValue;
    },
  });

  const isValid = computed(() => {
    const { validate } = fieldData.value ?? {};
    return isNotNil(validate) ? validate(value.value) : true;
  });

  return {
    fieldComponent,
    fieldValue,
    addonValue,
    isValid,
  };
}
