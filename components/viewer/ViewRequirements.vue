<template>
  <div v-if="obj.requireds.length > 0" class="obj-requirements">
    <div v-for="(req, idx) in obj.requireds" :key="idx" class="obj-requirement">
      <span v-if="req.beforeText">{{ req.beforeText }}</span>
      <span>{{ getObject(req.reqId)?.title ?? '???' }}</span>
      <span v-if="req.afterText">{{ req.afterText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProjectObj } from '~/composables/project';
import { useProjectStore } from '~/composables/store/project';

defineProps<{ obj: ProjectObj }>();

const { getObject } = useProjectStore();
</script>

<style lang="scss">
.obj-requirements {
  display: flex;
  flex-direction: column;
  align-items: center;

  .obj-requirement {
    display: flex;
    flex-direction: row;
    gap: 5px;
  }
}
</style>
