<template>
  <Dialog
    v-model:visible="showDetails"
    pt:root:class="!border-0 !bg-transparent !shadow-none overflow-hidden h-full !max-h-full "
    pt:mask:class="backdrop-blur-sm"
    :block-scroll="true"
    :dismissable-mask="true"
    :modal="true"
    :close-on-escape="true"
  >
    <template #container>
      <div
        v-if="obj && row"
        class="w-full h-full py-[1rem] px-[1rem] flex flex-col items-center overflow-auto relative"
      >
        <ViewDetailsAsync v-if="tab === 'details'" :obj="obj" :row="row">
          <template #right>
            <div class="absolute top-0 right-0 pt-2 pr-2 z-20">
              <div
                class="iconify carbon--close-outline size-6 text-surface-200 cursor-pointer"
                @click="close()"
              ></div>
            </div>
          </template>
        </ViewDetailsAsync>
        <ViewParentsAsync
          v-if="tab === 'parents'"
          :obj="obj"
          :row="row"
          :addon="addon"
        >
          <template #right>
            <div class="absolute top-0 right-0 pt-2 pr-2 z-20">
              <div
                class="iconify carbon--close-outline size-6 text-surface-200 cursor-pointer"
                @click="close()"
              ></div>
            </div>
          </template>
        </ViewParentsAsync>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { isNotNil } from 'ramda';

import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';

const ViewDetailsAsync = defineAsyncComponent(
  () => import('../details/ViewDetails.vue'),
);
const ViewParentsAsync = defineAsyncComponent(
  () => import('../parents/ViewParents.vue'),
);

const vStore = useViewerStore();
const pStore = useProjectStore();
const showDetails = computed<boolean>({
  get: () => vStore.showObjectDetails !== false,
  set: (val) => {
    if (val === false) {
      vStore.showObjectDetails = false;
    }
    // Do nothing when the value is true
  },
});

const obj = computed(() => {
  if (vStore.showObjectDetails) {
    return pStore.getObject(vStore.showObjectDetails.id);
  } else {
    return undefined;
  }
});
const addon = computed(() => {
  if (
    vStore.showObjectDetails &&
    'addonId' in vStore.showObjectDetails &&
    isNotNil(vStore.showObjectDetails.addonId)
  ) {
    return pStore.getObjectAddon(
      vStore.showObjectDetails.id,
      vStore.showObjectDetails.addonId,
    );
  } else {
    return undefined;
  }
});
const row = computed(() => {
  if (!obj.value) return undefined;
  const rowId = pStore.getObjectRow(obj.value.id);
  return pStore.getRow(rowId);
});
const tab = computed(() =>
  typeof vStore.showObjectDetails === 'object'
    ? vStore.showObjectDetails.tab
    : null,
);

const close = () => {
  vStore.showObjectDetails = false;
};
</script>

<style scoped lang="scss"></style>
