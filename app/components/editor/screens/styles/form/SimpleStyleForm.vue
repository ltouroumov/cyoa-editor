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

import { SimpleStyleFormConfig } from '~/components/editor/screens/styles/form/simple/forms';
import type { AnySimpleStyle } from '~/composables/project/types/v2/styles';

const model = defineModel<AnySimpleStyle>();

const form = computed(() => {
  if (isNil(model.value)) return [];
  return SimpleStyleFormConfig[model.value.target];
});

const onChange = (field: string, value: any) => {
  console.log('SimpleStyleForm onChange', field, value);
};

const onDisable = (field: string) => {
  console.log('SimpleStyleForm onDisable', field);
};
</script>

<style scoped lang="scss"></style>
