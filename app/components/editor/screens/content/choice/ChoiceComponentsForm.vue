<template>
  <div class="grid grid-cols-2 gap-2 auto-rows-auto">
    <template v-for="component in components" :key="component.key">
      <component :is="component.component" v-model="choice" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { filter, isNotNil, map, values } from 'ramda';

import ChoiceScoreForm from '~/components/editor/screens/content/choice/components/ChoiceScoreForm.vue';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import {
  type BaseComponent,
  ComponentType,
} from '~/composables/project/types/v2/objects/components/choice';

const choice = defineModel<ChoiceObject>({ required: true });

const components = computed((): ChoiceComponent[] => {
  return filter(
    (c): c is ChoiceComponent => isNotNil(c),
    map(
      (c) => dispatchComponent(c as BaseComponent<ComponentType>),
      values(choice.value.components),
    ),
  );
});

type ChoiceComponent = { key: ComponentType; component: any };
function dispatchComponent(
  component: BaseComponent<ComponentType>,
): ChoiceComponent | undefined {
  switch (component.type) {
    case ComponentType.Requirements:
      return {
        key: component.type,
        component: ChoiceRequirementsForm,
      };
    case ComponentType.Scores:
      return {
        key: component.type,
        component: ChoiceScoreForm,
      };
    default:
      return undefined;
  }
}

const ChoiceRequirementsForm = defineAsyncComponent(
  () => import('./components/ChoiceRequirementsForm.vue'),
);
</script>

<style scoped lang="scss"></style>
