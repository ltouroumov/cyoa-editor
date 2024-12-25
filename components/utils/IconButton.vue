<template>
  <Button
    :severity="$props.severity"
    :size="$props.size"
    :icon="$props.icon"
    :outlined="$props.outlined"
    pt:root:class="leading-none p-0 w-[2.5rem] h-[2.0rem]"
    pt:icon:class="leading-none text-[1.5rem] w-[1.5rem] h-[1.5rem]"
    v-bind="$props.pt?.button ?? {}"
  />
</template>

<script setup lang="ts">
import type { HintedString } from '@primevue/core';
import type { ButtonProps } from 'primevue';

defineProps<{
  icon: string;
  size?: 'small' | 'large';
  severity?:
    | HintedString<
        | 'secondary'
        | 'success'
        | 'info'
        | 'warn'
        | 'help'
        | 'danger'
        | 'contrast'
      >
    | undefined;
  outlined?: boolean;
  pt?: {
    button: Omit<
      ButtonProps,
      'icon' | 'severity' | 'size' | 'outlined' | 'link' | 'text'
    >;
  };
}>();

defineEmits(['click']);
</script>

<style scoped lang="scss"></style>
