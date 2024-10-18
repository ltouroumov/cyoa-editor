<template>
  <div>
    <div
      v-if="!editMode"
      class="d-flex justify-content-between align-items-center flex-row"
    >
      <span>{{ name }}</span>
      <button
        class="btn btn-light i-solar:pen-outline h-1em w-1em"
        @click="beginEdit()"
      ></button>
    </div>
    <div v-if="editMode" class="input-group input-group-sm">
      <input v-model="editName" type="text" class="form-control" />
      <button class="btn btn-outline-secondary" @click="commitEdit()">
        <div class="i-solar:check-circle-bold h-1em w-1em"></div>
      </button>
      <button class="btn btn-outline-secondary" @click="cancelEdit()">
        <div class="i-solar:close-circle-bold h-1em w-1em"></div>
      </button>
    </div>
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
