<template>
  <span>{{ termText }}</span>
</template>

<script setup lang="ts">
import { isNotNil, join, map } from 'ramda';
import { P, match } from 'ts-pattern';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();

const props = defineProps<{
  term: ConditionTerm;
}>();

const termText = computed(() => termToText(props.term));

function termToText(term: ConditionTerm): string {
  return match(term)
    .with({ allOf: P.select() }, (terms) => {
      return `all(${join(', ', map(termToText, terms))})`;
    })
    .with({ anyOf: P.select() }, (terms) => {
      return `any(${join(', ', map(termToText, terms))})`;
    })
    .with({ isSelected: P.string }, (term) => {
      const choice = projectStore.get(term.isSelected, ObjectType.choice);
      if (isNotNil(choice)) return `"${choice.name}"`;
      else return '???';
    })
    .with({ isNotSelected: P.string }, (term) => {
      const choice = projectStore.get(term.isNotSelected, ObjectType.choice);
      if (isNotNil(choice)) return `not("${choice.name}")`;
      else return '???';
    })
    .with({ always: true }, () => {
      return 'always';
    })
    .exhaustive();
}
</script>

<style scoped lang="scss"></style>
