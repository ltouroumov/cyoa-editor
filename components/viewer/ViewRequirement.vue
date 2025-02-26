<template>
  <div
    v-if="req.showRequired || showAlways"
    class="obj-requirement"
    :class="{ disabled: !isEnabled }"
  >
    <span v-if="!req.required && showAlways" class="req-before-text">
      Incompatible:
    </span>
    <span v-else-if="req.beforeText" class="req-before-text">
      {{ req.beforeText }}
    </span>
    <template v-if="req.type === 'id'">
      <span>{{ getObject(req.reqId)?.title ?? '???' }}</span>
    </template>
    <template v-else-if="req.type === 'or'">
      <span v-for="(orReq, idx) in req.orRequired" :key="idx">
        <template v-if="orReq.req">
          <span v-if="idx > 0"
            >,
            <span v-if="idx >= req.orRequired.length - 1">or</span>
          </span>
          {{ getObject(orReq.req)?.title ?? '???' }}
        </template>
      </span>
    </template>
    <div v-else>Unknown Condition</div>
    <span v-if="req.afterText">{{ req.afterText }}</span>
  </div>
</template>

<script setup lang="ts">
import { buildConditions } from '~/composables/conditions';
import type { ConditionTerm } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const { req, showAlways } = defineProps<{
  req: ConditionTerm;
  showAlways?: boolean;
}>();

const { getObject } = useProjectStore();

const { selectedIds } = useProjectRefs();

const condition = buildConditions(req);
const isEnabled = computed<boolean>(() => condition(selectedIds.value));
</script>

<style lang="scss">
.obj-requirement {
  .req-before-text {
    margin-right: 0.2rem;
  }

  &.disabled {
    display: none;
  }
}
</style>
