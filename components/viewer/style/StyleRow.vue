<template>
  <DynamicStyles :stylesheet="stylesheet" />
</template>

<script setup lang="ts">
import DynamicStyles from '~/components/utils/DynamicStyles.vue';
import { RowStyles } from '~/composables/project';

const { styles, rowId } = defineProps<{ styles: RowStyles; rowId: string }>();

const stylesheet = computed(() => {
  const parts = [];
  if (styles.rowBgColorIsOn) {
    parts.push(`.project-row { background-color: ${styles.rowBgColor}; }`);
  }

  if (parts.length > 0) {
    return `#row-${rowId} { ${parts.join('\n')} }`;
  } else {
    return '';
  }
});
</script>
