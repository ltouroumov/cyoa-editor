<template>
  <div v-if="requireds.length > 0" class="obj-requirements">
    <ViewRequirement
      v-for="(req, idx) in requireds"
      :key="idx"
      :req="req"
      :show-always="showAlways"
    />
  </div>
</template>

<script setup lang="ts">
import ViewRequirement from '~/components/viewer/ViewRequirement.vue';
import type { ConditionTerm } from '~/composables/project/types/v1';

defineProps<{ requireds: ConditionTerm[]; showAlways?: boolean }>();
</script>

<style lang="scss">
.obj-requirements {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
