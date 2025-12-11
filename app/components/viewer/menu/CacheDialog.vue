<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-2 py-1">
      <Message v-if="cacheOperation.status === 'idle'" severity="secondary">
        No operation in progress.
      </Message>
      <Message v-if="cacheOperation.status === 'running'" severity="info">
        <div class="flex flex-row items-center gap-1 w-full">
          <ProgressSpinner class="size-4" />
          <div class="grow w-full">
            {{ cacheOperation.progress ?? 'Running ...' }}
          </div>
        </div>
      </Message>
      <Message v-if="cacheOperation.status === 'completed'" severity="success">
        Cache operation completed.
      </Message>
      <Message v-if="cacheOperation.status === 'cancelled'" severity="warn">
        Cache operation cancelled.
      </Message>
      <Message v-if="cacheOperation.status === 'failure'" severity="error">
        Cache operation failed.
      </Message>
    </div>
    <div v-if="project" class="flex flex-col gap-2">
      <div class="flex flex-row items-center justify-between">
        <div class="text-primary text-2xl flex items-center gap-2">
          <span>{{ project.title }}</span>
          <span class="text-surface-400 text-sm">
            <span v-if="project.source === 'local'">Local</span>
            <span v-if="project.source === 'remote'">Remote</span>
            <span v-if="project.source === 'cached'">Cached</span>
          </span>
        </div>
        <div v-if="project.source === 'remote'">
          <Button
            :disabled="cacheOperation.status === 'running'"
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
            :disabled="cacheOperation.status === 'running'"
            @click="cacheProject(project.id, { refresh: true })"
          >
            <span class="iconify solar--refresh-linear"></span>
            Update
          </Button>
          <Button
            severity="danger"
            :disabled="cacheOperation.status === 'running'"
            @click="tryClearCache(project.id, $event)"
          >
            <span class="iconify solar--trash-bin-trash-linear"></span>
            Delete
          </Button>
        </div>
      </div>
    </div>
    <div class="min-h-[400px] relative">
      <div
        v-if="isEmpty(rows) || isNil(project)"
        class="absolute top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center"
      >
        <div class="text-surface-600 italic">No project data ...</div>
      </div>
      <DataTable
        v-else
        v-model:filters="filters"
        :value="rows"
        data-key="id"
        size="small"
        :scrollable="true"
        scroll-height="400px"
        :global-filter-fields="['id', 'title']"
      >
        <template #header>
          <div class="flex flex-row gap-2">
            <div class="grow font-bold text-primary text-xl">Images</div>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Keyword Search"
              />
            </IconField>
          </div>
        </template>
        <Column field="title" header="Section">
          <template #body="{ data }">
            <div class="flex flex-row gap-2 items-center">
              <span>{{ data.title }}</span>
              <span class="text-surface-600 text-sm">{{ data.id }}</span>
            </div>
          </template>
        </Column>
        <Column field="imageCount" header="Images" />
        <Column field="cacheStatus" header="Status">
          <template #body="{ data }">
            <Badge v-if="data.cacheStatus === false" severity="secondary">
              Not Cached
            </Badge>
            <Badge v-if="data.cacheStatus === 'partial'" severity="warning">
              Partial ({{ data.cachedImageCount }})
            </Badge>
            <Badge v-if="data.cacheStatus === 'cached'" severity="info">
              Cached
            </Badge>
          </template>
        </Column>
        <Column header-style="width: 3rem">
          <template #body="{ data }">
            <div class="flex flex-row gap-2 items-center">
              <Button
                icon="iconify solar--download-square-linear"
                size="small"
                @click="cacheProject(project.id, { images: [data.id] })"
              />
              <Button
                icon="iconify solar--trash-bin-trash-linear"
                severity="danger"
                size="small"
                :disabled="data.cacheStatus === false"
              />
            </div>
          </template>
          <template #header>
            <div class="flex flex-row gap-2 items-center">
              <Button
                icon="iconify solar--download-square-linear"
                size="small"
                @click="cacheProject(project.id, { images: true })"
              />
              <Button
                icon="iconify solar--trash-bin-trash-linear"
                severity="danger"
                size="small"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm } from 'primevue/useconfirm';
import { find, isEmpty, isNil, isNotEmpty, isNotNil, propEq } from 'ramda';

import type { Project } from '~/composables/project/types/v1';
import { imageIsUrl } from '~/composables/utils/imageIsUrl';
import { useImageCache } from '~/composables/viewer/cache/useImageCache';
import { useViewerLibrary } from '~/composables/viewer/useViewerLibrary';

const $confirm = useConfirm();
const $dialog: Ref = inject('dialogRef')!;

const {
  projectList,
  loadCachedData,
  cacheProject,
  clearCache,
  cacheOperation,
} = useViewerLibrary();
const { resolveImage } = useImageCache();

const project = computed(() => {
  return find(propEq($dialog.value.data.projectId, 'id'), projectList.value);
});

type RowInfo = {
  id: string;
  title: string;
  totalImageCount: number;
  cachedImageCount: number;
  cacheStatus: 'cached' | 'partial' | false;
};

const rows = computedAsync(async () => {
  if (!project.value) return [];
  if (project.value.source === 'remote') return [];

  const fileContents = await loadCachedData(project.value);
  const fileData = JSON.parse(fileContents) as Project;
  const projectId = project.value.id;

  const rows: RowInfo[] = [];
  for (const row of fileData.rows) {
    let totalImageCount = 0;
    let cachedImageCount = 0;
    if (isNotEmpty(row.image) && imageIsUrl(row.image)) {
      totalImageCount += 1;
      const resolved = await resolveImage(projectId, row.image);
      if (isNotNil(resolved)) {
        cachedImageCount += 1;
      }
    }
    for (const obj of row.objects) {
      if (isNotEmpty(obj.image) && imageIsUrl(obj.image)) {
        totalImageCount += 1;
        const resolved = await resolveImage(projectId, obj.image);
        if (isNotNil(resolved)) {
          cachedImageCount += 1;
        }
      }

      for (const addon of obj.addons) {
        if (isNotEmpty(addon.image) && imageIsUrl(addon.image)) {
          totalImageCount += 1;
          const resolved = await resolveImage(projectId, addon.image);
          if (isNotNil(resolved)) {
            cachedImageCount += 1;
          }
        }
      }
    }

    if (totalImageCount <= 0) {
      continue;
    }

    rows.push({
      id: row.id,
      title: row.title,
      totalImageCount,
      cachedImageCount,
      cacheStatus:
        cachedImageCount === 0
          ? false
          : cachedImageCount === totalImageCount
            ? 'cached'
            : 'partial',
    });
  }

  return rows;
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

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
      await clearCache(id);
    },
  });
};
</script>

<style scoped lang="scss"></style>
