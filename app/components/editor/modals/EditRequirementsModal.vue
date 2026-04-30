<template>
  <div>edit requirements</div>
</template>

<script setup lang="ts">
type DialogProps = { objectId: string; objectType: 'row' | 'obj' };
const dialogRef = inject<Ref<{ data: DialogProps }>>('dialogRef');

onMounted(() => {
  const { objectId, objectType } = dialogRef?.value?.data ?? {};
  console.log('Edit Requirements for', objectId, objectType);
});
</script>

<style scoped lang="scss"></style>
