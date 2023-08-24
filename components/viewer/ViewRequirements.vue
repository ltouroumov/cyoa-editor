<template>
  <div class="obj-requirements" v-if="obj.requireds.length > 0">
    <div class="obj-requirement"
         v-for="req in obj.requireds">
      <span v-if="req.beforeText">{{ req.beforeText }}</span>
      <span>{{ getName(req.reqId) }}</span>
      <span v-if="req.afterText">{{ req.afterText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProjectObj } from '~/composables/project';
import { useProjectStore } from '~/composables/store/project';

defineProps<{ obj: ProjectObj }>();

const { getName } = useProjectStore();
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