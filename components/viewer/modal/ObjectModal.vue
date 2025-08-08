<template>
  <Dialog
    v-model:visible="showDetails"
    pt:root:class="!border-0 !bg-transparent overflow-hidden"
    pt:mask:class="backdrop-blur-sm"
    dismissable-mask
    close-on-escape
    block-scroll
  >
    <template #container="{}">
      <div
        v-if="obj && row"
        class="w-full flex flex-col items-center overflow-auto"
      >
        <ViewProjectObjDetailsAsync :obj="obj" :row="row" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';

const ViewProjectObjDetailsAsync = defineAsyncComponent(
  () => import('../ViewProjectObjDetails.vue'),
);

const vStore = useViewerStore();
const pStore = useProjectStore();
const showDetails = computed(() => vStore.showObjectDetails !== false);

const obj = computed(() => {
  if (!vStore.showObjectDetails) return undefined;
  return pStore.getObject(vStore.showObjectDetails);
});
const row = computed(() => {
  if (!vStore.showObjectDetails) return undefined;
  const rowId = pStore.getObjectRow(vStore.showObjectDetails);
  return pStore.getRow(rowId);
});
</script>

<style scoped lang="scss"></style>
