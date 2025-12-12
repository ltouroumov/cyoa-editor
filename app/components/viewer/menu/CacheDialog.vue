<template>
  <div class="flex flex-col gap-2">
    <CacheOperations
      :cache-operations="cacheOperations"
      ,
      @abort="abortCache"
      @clear="clearOperation"
    />
    <div v-if="project" class="flex flex-col">
      <div class="flex flex-row items-center justify-between mb-2">
        <div class="text-primary text-2xl flex items-center gap-2">
          <span>{{ project.title }}</span>
        </div>
        <div>
          <span
            v-if="project.source === 'local'"
            class="font-bold text-cyan-500"
          >
            Local
          </span>
          <span
            v-else-if="project.source === 'remote'"
            class="font-bold italic text-gray-500"
            >Remote</span
          >
          <span
            v-else-if="project.source === 'cached'"
            class="font-bold text-indigo-500"
          >
            Cached
          </span>
        </div>
      </div>
      <div class="flex flex-row gap-2 items-center">
        <div class="grow flex flex-row items-center gap-2">
          <span class="text-xl">Project</span>
          <span v-if="isNotNil(rows)" class="text-sm">
            (sections: {{ rows.totalRows }})
          </span>
        </div>

        <div v-if="project.source === 'remote'">
          <Button
            :disabled="hasActiveOperation(project.id, 'project')"
            @click="cacheProject(project.id, { images: false })"
          >
            <span class="iconify solar--cloud-download-linear"></span>
            Download
          </Button>
        </div>
        <div
          v-if="project.source === 'cached'"
          class="flex flex-row gap-2 justify-end"
        >
          <Button
            :disabled="hasActiveOperation(project.id, 'project')"
            @click="cacheProject(project.id, { refresh: true })"
          >
            <span class="iconify solar--refresh-linear"></span>
            Update
          </Button>
          <Button
            severity="danger"
            :disabled="hasActiveOperation(project.id, 'project')"
            @click="tryClearCache(project.id, $event)"
          >
            <span class="iconify solar--trash-bin-trash-linear"></span>
            Delete
          </Button>
        </div>
      </div>
      <div class="w-full border-t border-surface-700 my-2"></div>
      <div class="flex flex-row gap-2 items-start">
        <div class="grow flex flex-col gap-2">
          <div class="flex flex-row items-center gap-2">
            <span class="text-xl">Images</span>
            <span v-if="isNotNil(rows)" class="text-sm">
              (total: {{ rows.totalImages }}, cached:
              {{ rows.totalImagesCached }})
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-2 justify-end">
          <div v-if="!hasCachedImages" class="flex flex-row gap-2 justify-end">
            <Button
              :disabled="hasActiveOperation(project.id, 'project')"
              @click="cacheProject(project.id, { images: false })"
            >
              <span class="iconify solar--cloud-download-linear"></span>
              Download
            </Button>
          </div>
          <div v-else class="flex flex-row gap-2 justify-end">
            <Button
              :disabled="hasActiveOperation(project.id, 'project')"
              @click="cacheProject(project.id, { refresh: true })"
            >
              <span class="iconify solar--refresh-linear"></span>
              Update
            </Button>
            <Button
              severity="danger"
              :disabled="hasActiveOperation(project.id, 'project')"
              @click="tryClearCache(project.id, $event)"
            >
              <span class="iconify solar--trash-bin-trash-linear"></span>
              Delete
            </Button>
          </div>

          <div class="flex flex-row gap-2 items-center">
            <Checkbox
              v-model="imagesAdvanced"
              :binary="true"
              input-id="images-advanced-mode"
            />
            <label for="images-advanced-mode">Advanced Mode</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { find, isNotEmpty, isNotNil, propEq } from 'ramda';

import CacheOperations from '~/components/viewer/menu/CacheOperations.vue';
import type { Project } from '~/composables/project/types/v1';
import type { CacheItem } from '~/composables/shared/tables/viewer_projects';
import { imageIsUrl } from '~/composables/utils/imageIsUrl';
import { useViewerLibrary } from '~/composables/viewer/useViewerLibrary';

const $confirm = useConfirm();
const $dialog: Ref = inject('dialogRef')!;
const imagesAdvanced = ref<boolean>(false);

const {
  projectList,
  cacheProject,
  clearCache,
  hasActiveOperation,
  loadCachedData,
  cacheOperations,
  clearOperation,
  abortCache,
} = useViewerLibrary();

const project = computed(() => {
  return find(propEq($dialog.value.data.projectId, 'id'), projectList.value);
});

const rows = computedAsync(async () => {
  if (!project.value) return null;
  if (project.value.source === 'remote') return null;

  const fileContents = await loadCachedData(project.value);
  const fileData = JSON.parse(fileContents) as Project;

  let totalRows = 0;
  let totalImages = 0;
  for (const row of fileData.rows) {
    totalRows++;

    if (isNotEmpty(row.image) && imageIsUrl(row.image)) {
      totalImages++;
    }
    for (const obj of row.objects) {
      if (isNotEmpty(obj.image) && imageIsUrl(obj.image)) {
        totalImages++;
      }

      for (const addon of obj.addons) {
        if (isNotEmpty(addon.image) && imageIsUrl(addon.image)) {
          totalImages++;
        }
      }
    }
  }

  const cachedItems: CacheItem[] = project.value.cachedItems ?? [];
  const allImagesCached = cachedItems.some(
    (item) => item.type === 'images.all',
  );
  const totalImagesCached = allImagesCached
    ? totalImages
    : cachedItems.reduce((acc, item) => {
        if (item.type === 'images.row') return acc + item.count;
        else return acc;
      }, 0);
  return { totalRows, totalImages, totalImagesCached };
}, null);

const tryClearCache = async (id: string, $event: any) => {
  $confirm.require({
    target: $event.currentTarget,
    message: 'Clear cache?',
    icon: 'pi pi-exclamation-triangle',
    group: 'popup',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Clear',
    },
    accept: async () => {
      await clearCache(id, {});
    },
  });
};

const hasCachedImages = computed(() => {
  return project.value?.cachedItems?.some((cacheItem) => {
    return cacheItem.type === 'images.all' || cacheItem.type === 'images.row';
  });
});
</script>

<style scoped lang="scss"></style>
