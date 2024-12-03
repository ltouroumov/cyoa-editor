<template>
  <div class="flex flex-col items-stretch gap-2">
    <Fluid>
      <IftaLabel>
        <InputText v-model="props.name" />
        <label>Project Name</label>
      </IftaLabel>
    </Fluid>
    <div class="flex flex-row justify-end">
      <Button @click="doSave">Create</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { clone } from 'ramda';

const dialogRef = inject<any>('dialogRef');

const props = ref({
  name: '',
});

const doSave = () => {
  dialogRef.value.close(clone(props.value));
};
</script>

<style scoped lang="scss"></style>
