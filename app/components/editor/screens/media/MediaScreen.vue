<template>
  <DataView :value="images" data-key="id">
    <template #list="{ items }">
      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="item in items"
          :key="item.id"
          class="col-span-3 md:col-span-1"
        >
          <MediaCard :image="item" />
        </div>
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { useProjectStoreRefs } from '~/composables/project/useProjectStore';

const { media } = useProjectStoreRefs();

const images = computed(() => {
  return Object.values(media.value.images);
});
</script>

<style scoped lang="scss"></style>
