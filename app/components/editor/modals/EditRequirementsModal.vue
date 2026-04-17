<template>
  <div>edit requirements</div>
</template>

<script setup lang="ts">
const dialogRef = inject<Ref<{ data: any }>>('dialogRef');

onMounted(() => {
  const params = dialogRef?.value?.data;
  console.log('Edit Requirements modal opened with params:', params);
});
</script>

<style scoped lang="scss"></style>
