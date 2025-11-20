<template>
  <div
    v-if="req.showRequired || showAlways"
    class="obj-requirement break-normal"
    :class="{ disabled: !isEnabled }"
  >
    <span v-if="!req.required && showAlways" class="req-before-text">
      Incompatible:
    </span>
    <span v-else-if="req.beforeText" class="req-before-text">
      {{ req.beforeText }}
    </span>
    <span v-if="req.type === 'id'" class="inline-flex items-center">
      <span>{{ getObject(req.reqId)?.title ?? '???' }}</span>
    </span>
    <template v-else-if="req.type === 'or'">
      <span v-for="(orReq, idx) in req.orRequired" :key="idx">
        <template v-if="orReq.req">
          {{
            idx > 0 ? (idx >= req.orRequired.length - 1 ? ', or ' : ', ') : ''
          }}
          {{ getObject(orReq.req)?.title ?? '???' }}
        </template>
      </span>
    </template>
    <div v-else>Unknown Condition</div>
    <span v-if="req.afterText">{{ req.afterText }}</span>
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
</script>

<style lang="scss">
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
