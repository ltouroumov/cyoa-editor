<template>
  <div class="flex flex-row items-center pe-4">
    <div v-for="(action, index) in actions" :key="index">
      <Button
        :label="action.label"
        :icon="action.icon"
        :severity="action.severity"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useActionsDispatch } from '~/components/editor/actions/useActionsDispatch';

const { actions } = useActionsDispatch();
</script>

<style scoped lang="scss"></style>
