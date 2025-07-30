<template>
  <Dialog
    v-model:visible="showDetails"
    pt:root:class="!border-0 !bg-transparent !max-h-full"
    pt:mask:class="backdrop-blur-sm"
    dismissable-mask
    close-on-escape
    block-scroll
  >
    <template #container="{}">
      <div
        v-if="store.showObjectDetails"
        class="w-full flex flex-col items-center overflow-auto"
      >
        <div class="w-1/2">
          <ViewProjectObjDetailsAsync :obj-id="store.showObjectDetails" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useViewerStore } from '~/composables/store/viewer';

const ViewProjectObjDetailsAsync = defineAsyncComponent(
  () => import('../ViewProjectObjDetails.vue'),
);

const store = useViewerStore();
const showDetails = computed(() => store.showObjectDetails !== false);
</script>

<style scoped lang="scss"></style>
