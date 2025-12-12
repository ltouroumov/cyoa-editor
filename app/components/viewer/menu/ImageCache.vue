<template>
  <div class="min-h-[400px] relative">
    <div
      v-if="isEmpty(rows) && isNil(project)"
      class="absolute top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center"
    >
      <div class="text-surface-600 italic">No project data ...</div>
    </div>
    <div
      v-if="isEmpty(rows) && !isNil(project)"
      class="absolute top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center"
    >
      <div class="text-surface-600 italic">
        <ProgressSpinner class="size-6" />
      </div>
    </div>
    <DataTable
      v-if="!isEmpty(rows) && !isNil(project)"
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
      <Column field="totalImageCount" header="Images" />
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
              :disabled="
                hasActiveOperation(project.id, `images.${data.id}`) ||
                hasActiveOperation(project.id, 'images')
              "
              @click="
                cacheProject(project.id, { images: [data.id], refresh: true })
              "
            />
            <Button
              icon="iconify solar--trash-bin-trash-linear"
              severity="danger"
              size="small"
              :disabled="
                data.cacheStatus === false ||
                hasActiveOperation(project.id, `images.${data.id}`) ||
                hasActiveOperation(project.id, 'images')
              "
              @click="clearCache(project.id, { images: [data.id] })"
            />
          </div>
        </template>
        <template #header>
          <div class="flex flex-row gap-2 items-center">
            <Button
              icon="iconify solar--download-square-linear"
              size="small"
              :disabled="hasActiveOperation(project.id, `images`)"
              @click="cacheProject(project.id, { images: true, refresh: true })"
            />
            <Button
              icon="iconify solar--trash-bin-trash-linear"
              severity="danger"
              size="small"
              :disabled="hasActiveOperation(project.id, `images`)"
              @click="clearCache(project.id, { images: true })"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { isEmpty, isNil, isNotEmpty, isNotNil } from 'ramda';

import type { Project } from '~/composables/project/types/v1';
import { imageIsUrl } from '~/composables/utils/imageIsUrl';
import { useImageCache } from '~/composables/viewer/cache/useImageCache';
import type { ProjectListEntry } from '~/composables/viewer/types';
import { useViewerLibrary } from '~/composables/viewer/useViewerLibrary';

const $props = defineProps<{ project: ProjectListEntry }>();

const { loadCachedData, cacheProject, clearCache, hasActiveOperation } =
  useViewerLibrary();
const { resolveImage } = useImageCache();

type RowInfo = {
  id: string;
  title: string;
  totalImageCount: number;
  cachedImageCount: number;
  cacheStatus: 'cached' | 'partial' | false;
};

const rows = computedAsync(async () => {
  if (!$props.project) return [];
  if ($props.project.source === 'remote') return [];

  const fileContents = await loadCachedData($props.project);
  const fileData = JSON.parse(fileContents) as Project;
  const projectId = $props.project.id;

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
</script>

<style scoped lang="scss"></style>
