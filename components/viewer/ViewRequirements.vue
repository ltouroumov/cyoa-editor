<template>
  <div v-if="requireds.length > 0" class="obj-requirements">
    <div v-for="(req, idx) in requireds" :key="idx" :req="req">
      <div v-if="req.type === 'id'">
        <ViewRequirement :key="idx" :req="req" />
      </div>
      <div v-else-if="req.type === 'or'">
        <ViewRequirement
          v-for="(reqOr, idOr) in req.orRequired"
          :key="idOr"
          :req="req"
          :req-id="reqOr.req"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ViewRequirement from '~/components/viewer/ViewRequirement.vue';
import { ConditionTerm } from '~/composables/project';

defineProps<{ requireds: ConditionTerm[] }>();
</script>

<style lang="scss">
.obj-requirements {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
