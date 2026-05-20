<template>
  <div class="flex flex-row gap-2">
    <div
      class="grid grid-cols-2 border border-surface-600 rounded-xl overflow-hidden"
    >
      <div class="flex flex-col border-r border-surface-600">
        <div class="font-bold p-2">Current Image</div>
        <div class="w-100 aspect-6/5 relative">
          <div class="image-bg z-10"></div>
          <div
            class="absolute bottom-0 left-0 right-0 z-30 p-2 bg-surface-900/50 flex flex-row gap-2 justify-between"
          >
            <div
              v-if="image.isRemote"
              class="text-muted-color shrink truncate text-ellipsis"
            >
              {{ image.data }}
            </div>
            <div v-else class="text-muted-color italic">
              {{ Math.floor(image.data.length / 1024) }} KB
            </div>
            <div class="shrink-0">
              {{ image.isRemote ? 'Remote' : 'Local' }}
            </div>
          </div>
          <img
            :src="image.data"
            :alt="image.id"
            class="w-full h-full object-contain z-20 relative"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div class="flex flex-col">
        <div class="font-bold p-2">Image Preview</div>
        <div class="relative w-100 aspect-6/5">
          <div
            class="absolute bottom-0 left-0 right-0 z-30 p-2 bg-surface-900/50 flex flex-row gap-2 justify-between"
          >
            <div v-if="imageData.isRemote" class="grow">
              <InputText
                v-model="imageData.dataSrc"
                placeholder="Image URL ..."
                fluid
              />
            </div>
            <div v-else>
              <FileUpload
                mode="basic"
                :auto="true"
                :custom-upload="true"
                accept="image/*"
                :max-file-size="10_000_000"
                @select="updateImage"
              />
            </div>
            <Select
              v-model="imageData.isRemote"
              :options="[
                { label: 'Local', value: false },
                { label: 'Remote', value: true },
              ]"
              option-label="label"
              option-value="value"
              fluid
              class="w-40"
            />
          </div>
          <div class="image-bg z-10"></div>
          <img
            :src="imageData.dataSrc || imageData.data"
            :alt="image.id"
            class="w-full h-full object-contain relative z-20"
          />
        </div>
        <div class="flex flex-row gap-2 justify-end p-2">
          <Button severity="secondary" size="small" @click="cancel()">
            Cancel
          </Button>
          <Button size="small" @click="commit()">Save</Button>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 grow">
      <div class="flex flex-row gap-2">
        <IftaLabel class="grow">
          <InputText v-model="image.metadata.title" fluid />
          <label class="font-bold">Title</label>
        </IftaLabel>
        <IftaLabel>
          <InputText v-model="image.id" disabled />
          <label class="font-bold">Image ID</label>
        </IftaLabel>
      </div>
      <div class="flex flex-col gap-2 grow">
        <div class="text-primary font-bold">Metadata</div>
        <IftaLabel>
          <InputText v-model="image.metadata.author" fluid />
          <label class="font-bold">Author</label>
        </IftaLabel>
        <IftaLabel>
          <InputText v-model="image.metadata.source" fluid />
          <label class="font-bold">Source</label>
        </IftaLabel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue';

import { useDraftImage } from '~/composables/editor/draft/useDraftImage';
import { useSaveDraft } from '~/composables/editor/draft/useSaveDraft';

const props = defineProps<{
  imageId: string;
}>();

const image = useDraftImage(() => props.imageId);

const {
  draft: imageData,
  commit,
  cancel,
} = useSaveDraft<{ isRemote: boolean; dataSrc?: string; data?: string }>(
  () => {
    const image0 = image.value;
    if (image0.isRemote) {
      return { isRemote: true, dataSrc: image0.data, data: image0.data };
    } else {
      return { isRemote: false, data: image0.data };
    }
  },
  (newValue) => {
    if (newValue.isRemote) {
      image.value.isRemote = true;
      image.value.data = newValue.dataSrc!;
    } else {
      image.value.isRemote = false;
      image.value.data = newValue.data!;
    }
  },
);

const updateImage = (event: FileUploadSelectEvent) => {
  const file = event.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    if (!e.target) return;
    imageData.value.data = e.target.result as string;
    imageData.value.dataSrc = undefined;
  };

  reader.readAsDataURL(file);
};
</script>

<style scoped lang="scss">
.image-bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  background: repeating-linear-gradient(
    315deg,
    var(--p-surface-800),
    var(--p-surface-800) 10px,
    var(--p-surface-700) 10px,
    var(--p-surface-700) 20px
  );
}
</style>
