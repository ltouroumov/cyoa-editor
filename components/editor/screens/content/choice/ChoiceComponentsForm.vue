<template>
  <div class="grid grid-cols-2 auto-rows-auto">
    <div v-for="component in components" :key="component.key">
      <component :is="component.component" v-bind="component.props ?? {}" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { filter, isNotNil, map, values } from 'ramda';

import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  type BaseComponent,
  ComponentType,
} from '~/composables/project/types/v2/objects/components/choice';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  choiceId: string;
}>();

const choice = computed((): ChoiceObject => {
  return projectStore.get(props.choiceId, ObjectType.choice)!;
});

const components = computed((): ChoiceComponent[] => {
  return filter(
    (c): c is ChoiceComponent => isNotNil(c),
    map(
      (c) => dispatchComponent(c as BaseComponent<ComponentType>),
      values(choice.value.components),
    ),
  );
});

type ChoiceComponent = { key: ComponentType; component: any; props?: any };
function dispatchComponent(
  component: BaseComponent<ComponentType>,
): ChoiceComponent | undefined {
  console.log('dispatchComponent', component);

  switch (component.type) {
    case ComponentType.Requirements:
      return {
        key: component.type,
        component: ChoiceRequirementsForm,
        props: { choiceId: props.choiceId },
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
