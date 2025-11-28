<template>
  <div>
    <div v-if="!editMode" class="flex justify-between items-center flex-row">
      <span>{{ name }}</span>
      <Button
        variant="text"
        severity="contrast"
        icon="iconify solar--pen-outline h-1em w-1em"
        size="small"
        @click="beginEdit()"
      ></Button>
    </div>
    <InputGroup v-if="editMode">
      <InputText v-model="editName" type="text" fluid />
      <InputGroupAddon>
        <Button
          variant="text"
          severity="contrast"
          icon="iconify solar--check-circle-bold h-1em w-1em"
          @click="commitEdit()"
        />
        <Button
          variant="text"
          severity="contrast"
          icon="iconify solar--close-circle-bold h-1em w-1em"
          @click="cancelEdit()"
        />
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
const $emit = defineEmits<{
  (e: 'change', name: string): void;
}>();

const $props = defineProps<{
  name: string;
}>();

const editMode = ref<boolean>(false);
const editName = ref<string>('');

const beginEdit = () => {
  editName.value = $props.name;
  editMode.value = true;
};

const commitEdit = () => {
  const value = editName.value;
  $emit('change', value);
  editMode.value = false;
};
const cancelEdit = () => {
  editMode.value = false;
};
</script>

<style scoped lang="scss"></style>
