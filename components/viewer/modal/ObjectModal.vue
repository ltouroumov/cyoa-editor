<template>
  <Dialog
    v-model:visible="showDetails"
    pt:root:class="!border-0 !bg-transparent !shadow-none overflow-hidden h-full !max-h-full "
    pt:mask:class="backdrop-blur-sm"
    block-scroll
  >
    <template #container>
      <div
        v-if="obj && row"
        class="w-full h-full py-[1rem] px-[1rem] flex flex-col items-center overflow-auto relative"
      >
        <ViewDetailsAsync :obj="obj" :row="row">
          <template #right>
            <div class="absolute top-0 right-0 pt-2 pr-2 z-20">
              <div
                class="iconify carbon--close-outline size-6 text-surface-200 cursor-pointer"
                @click="close()"
              ></div>
            </div>
          </template>
        </ViewDetailsAsync>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';

const ViewDetailsAsync = defineAsyncComponent(
  () => import('../details/ViewDetails.vue'),
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

const close = () => {
  vStore.showObjectDetails = false;
};
</script>

<style scoped lang="scss"></style>
