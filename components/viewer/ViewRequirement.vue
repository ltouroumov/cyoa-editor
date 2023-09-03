<template>
  <div class="obj-requirement" :class="{ disabled: !isEnabled }">
    <span v-if="req.beforeText">{{ req.beforeText }}</span>
    <span>{{ getObject(req.reqId)?.title ?? '???' }}</span>
    <span v-if="req.afterText">{{ req.afterText }}</span>
  </div>
</template>

<script setup lang="ts">
import { buildConditions } from '~/composables/conditions';
import { ConditionTerm } from '~/composables/project';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';

const { req } = defineProps<{ req: ConditionTerm }>();

const { getObject } = useProjectStore();

const { selected } = useProjectRefs();

const condition = buildConditions(req);
const isEnabled = computed<boolean>(() => condition(selected.value));
</script>

<style lang="scss">
.obj-requirement {
  display: flex;
  flex-direction: row;
  gap: 5px;

  &.disabled {
    display: none;
  }
}
</style>
