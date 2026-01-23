<template>
  <InputGroup>
    <InputGroupAddon>
      <Checkbox :model-value="isEnabled" binary @change="onEnabledChange" />
    </InputGroupAddon>
    <IftaLabel>
      <component
        :is="fieldComponent.input.type"
        v-if="isNotNil(fieldComponent)"
        v-bind="fieldComponent.input.props"
        v-model="fieldValue"
        :disabled="!isEnabled"
        :invalid="!isValid"
      />
      <label
        :for="makeKey(parent, form.key)"
        class="inline-flex items-center gap-1"
      >
        <span>{{ form.label }}</span>

        <span
          v-if="!isValid"
          class="iconify solar--danger-bold-duotone text-red-500"
        />
      </label>
    </IftaLabel>
    <InputGroupAddon v-if="fieldComponent?.addon && isEnabled">
      <component
        :is="fieldComponent.addon.type"
        v-bind="fieldComponent.addon.props"
        v-model="addonValue"
      />
    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import { isNotNil, path } from 'ramda';

import { useField } from '~/components/editor/screens/styles/form/simple/fields';
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
  return isNotNil(dataValue.value);
});

const dataValue = computed({
  get: (): any => {
    return path(props.form.prop, props.style);
  },
  set: (value: any) => {
    const fieldKey = makeKey(props.parent, props.form.key);
    emit('change', fieldKey, value);
  },
});

const { fieldComponent, fieldValue, addonValue, isValid } = useField(
  computed(() => props.form),
  dataValue,
);

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
</script>

<style scoped lang="scss"></style>
