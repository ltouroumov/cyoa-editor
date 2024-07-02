<template>
  <DynamicStyles :stylesheet="stylesheet" />
</template>

<script setup lang="ts">
import DynamicStyles from '~/components/utils/DynamicStyles.vue';
import { ProjectStyles } from '~/composables/project';

const { styles } = defineProps<{ styles: ProjectStyles }>();

const stylesheet = computed(() => {
  const parts = [];
  parts.push(`.project { background-color: ${styles.backgroundColor}; }`);
  return parts.join('\n');
});
</script>
