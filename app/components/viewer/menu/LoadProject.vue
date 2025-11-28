<template>
  <div class="load-project" :class="{ inline: $props.inline ?? false }">
    <div class="load-input">
      <FileUpload
        mode="basic"
        :custom-upload="true"
        accept="application/json"
        :max-file-size="100 * 1024 * 1024"
        :auto="true"
        choose-icon="pi pi-file-plus"
        choose-label="Upload Project"
        @select="onFileSelect"
      />
    </div>
    <div v-if="error" class="alert alert-danger load-error mb-3" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { readFileContents } from '~/composables/utils';

const $props = defineProps<{ inline?: boolean }>();

const { loadProject } = useProjectStore();
const { toggleProjectMenu } = useViewerStore();
const fileInput = ref<HTMLInputElement>();
const canLoad = ref<boolean>(false);
const error = ref<string | null>(null);

const checkCanLoad = () => {
  error.value = null;
  if (fileInput.value && fileInput.value.files) {
    const [file] = fileInput.value.files;
    if (!file) {
      canLoad.value = false;
    } else if (file.type !== 'application/json') {
      canLoad.value = false;
      error.value = 'File is not JSON';
    } else {
      canLoad.value = true;
    }
  } else {
    canLoad.value = false;
  }
};

checkCanLoad();

const onFileSelect = async (event: any) => {
  const file = event.files[0];
  toggleProjectMenu(false);
  await loadProject(async (setProgress) => {
    await setProgress('0%');
    const data = await readFileContents(file, (loaded, total) => {
      setProgress(`${Math.round((loaded / total) * 100)}%`);
    });
    await setProgress('100%');
    if (data && typeof data === 'string') {
      return {
        fileContents: data,
        fileName: file.name,
      };
    }
  });
};
</script>

<style lang="scss">
.inline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .load-input {
    margin-bottom: 0 !important;
    label {
      display: none;
    }
  }
}

.load-project {
  .load-input {
    margin-bottom: 0.75rem;
  }
}
</style>
