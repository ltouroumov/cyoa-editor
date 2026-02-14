<template>
  <div
    v-if="req.showRequired || showAlways"
    class="obj-requirement break-normal"
    :class="{ disabled: !isEnabled }"
  >
    <span>{{ condText }}</span>
    <span v-if="isActive" class="iconify solar--check-circle-bold ms-1"></span>
  </div>
</template>

<script setup lang="ts">
import { buildConditions, buildRootCondition } from '~/composables/conditions';
import type { ConditionTerm } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const $props = defineProps<{
  req: ConditionTerm;
  showAlways?: boolean;
}>();

const { getObject } = useProjectStore();

const { selectedIds } = useProjectRefs();

const enabledCond = computed(() => buildConditions($props.req));
const isEnabled = computed<boolean>(() => enabledCond.value(selectedIds.value));

const activeCond = computed(() => buildRootCondition([$props.req]));
const isActive = computed<boolean>(() => {
  const { exec } = activeCond.value;
  return exec(selectedIds.value);
});

const condText = computed(() => {
  let prefix: string = '';
  if (!$props.req.required && $props.showAlways) {
    prefix = 'Incompatible: ';
  } else if ($props.req.beforeText) {
    prefix = `${$props.req.beforeText.trim()} `;
  }

  let body: string = '';
  if ($props.req.type === 'id') {
    body = `${getObject($props.req.reqId)?.title}`;
  } else if ($props.req.type === 'or') {
    for (const [idx, { req }] of $props.req.orRequired.entries()) {
      if (!req) continue;
      if (idx > 0) {
        body += idx === $props.req.orRequired.length - 1 ? ', or ' : ', ';
      }
      body += getObject(req)?.title ?? '???';
    }
  } else {
    body = '(err:unknown-condition)';
  }

  let suffix: string = '';
  if ($props.req.afterText) {
    suffix = ` ${$props.req.afterText.trim()}`;
  }

  return `${prefix}${body}${suffix}`;
});
</script>

<style lang="scss">
@reference "#main.css";

.obj-requirement {
  //display: inline-flex;
  //align-items: center;
  //flex-wrap: wrap;

  .req-before-text {
    //margin-right: 0.2rem;
  }

  &.disabled {
    @apply line-through;
  }

  .active {
    font-weight: bold;
  }
}
</style>
