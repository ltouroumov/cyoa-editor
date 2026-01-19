<template>
  <InputGroup>
    <InputGroupAddon>
      <Checkbox v-model="isEnabled" binary />
    </InputGroupAddon>
    <slot :disabled="!isEnabled" />
    <InputGroupAddon v-if="isEnabled && $slots.addon">
      <slot name="addon" />
    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts" generic="T">
const model = defineModel<T | undefined>();

const props = defineProps<{
  defaultValue: T;
}>();

const isEnabled = computed({
  get: () => model.value !== undefined,
  set: (newValue) => {
    if (newValue && model.value === undefined) {
      model.value = props.defaultValue;
    } else if (!newValue) {
      model.value = undefined;
    }
  },
});
</script>
