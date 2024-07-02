<template>
  <DynamicStyles :stylesheet="stylesheet" />
</template>

<script setup lang="ts">
import DynamicStyles from '~/components/utils/DynamicStyles.vue';
import { RowStyles } from '~/composables/project';

const { styles, objId } = defineProps<{ styles: RowStyles; objId: string }>();

const stylesheet = computed(() => {
  const parts = [];

  // TODO: Wire the right props here
  if (styles.rowBgColorIsOn) {
    parts.push(`&.project-obj { background-color: ${styles.rowBgColor}; }`);
  }

  if (parts.length > 0) {
    return `#obj-${objId} { ${parts.join('\n')} }`;
  } else {
    return '';
  }
});
</script>
