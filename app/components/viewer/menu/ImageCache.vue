<template>
  <div class="min-h-[400px] relative">
    <DataTable
      v-model:filters="filters"
      :value="rows"
      data-key="id"
      size="small"
      :scrollable="true"
      scroll-height="400px"
      :global-filter-fields="['id', 'title']"
      :loading="loading"
    >
      <template #header>
        <div class="flex flex-row gap-2">
          <IconField class="w-full">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
              class="w-full"
            />
          </IconField>
        </div>
      </template>
      <template #empty>
        <div
          class="w-full flex flex-row items-center justify-center text-surface-700 min-h-[200px]"
        >
          <div>No sections.</div>
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
                hasActiveOperation0(
                  activeOperations,
                  project.id,
                  `images.${data.id}`,
                ) || hasActiveOperation0(activeOperations, project.id, 'images')
              "
              @click="
                $emit('cache', project.id, {
                  images: [data.id],
                  project: false,
                  refresh: true,
                })
              "
            />
            <Button
              icon="iconify solar--trash-bin-trash-linear"
              severity="danger"
              size="small"
              :disabled="
                data.cacheStatus === false ||
                hasActiveOperation0(
                  activeOperations,
                  project.id,
                  `images.${data.id}`,
                ) ||
                hasActiveOperation0(activeOperations, project.id, 'images')
              "
              @click="$emit('clear', project.id, { images: [data.id] })"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { includes, isNotEmpty } from 'ramda';

import type { Project } from '~/composables/project/types/v1';
import { imageIsCacheable } from '~/composables/utils/imageIsUrl';
import type {
  CacheOptions,
  ClearOptions,
} from '~/composables/viewer/cache/types';
import type { ProjectListEntry } from '~/composables/viewer/types';
import {
  type CacheOperation,
  hasActiveOperation0,
} from '~/composables/viewer/useViewerLibrary';

const $props = defineProps<{
  project: ProjectListEntry;
  projectData: Project;
  activeOperations: CacheOperation[];
}>();

defineEmits<{
  (e: 'cache', projectId: string, options: CacheOptions): void;
  (e: 'clear', projectId: string, options: ClearOptions): void;
}>();

type RowInfo = {
  id: string;
  title: string;
  totalImageCount: number;
  cacheStatus: 'cached' | 'partial' | false;
};

const rows = ref<RowInfo[]>([]);
const loading = ref<boolean>(false);

watch(
  [() => $props.project, () => $props.projectData],
  async () => {
    if ($props.project.source === 'remote') return [];

    loading.value = true;
    await nextTick();

    const fileData = $props.projectData;

    const cachedRows = ($props.project.cachedItems ?? []).map(
      (item) => item.rowId,
    );

    const rows0: RowInfo[] = [];
    for (const row of fileData.rows) {
      let totalImageCount = 0;
      if (isNotEmpty(row.image) && imageIsCacheable(row.image)) {
        totalImageCount += 1;
      }
      for (const obj of row.objects) {
        if (isNotEmpty(obj.image) && imageIsCacheable(obj.image)) {
          totalImageCount += 1;
        }
        for (const addon of obj.addons) {
          if (isNotEmpty(addon.image) && imageIsCacheable(addon.image)) {
            totalImageCount += 1;
          }
        }
      }

      if (totalImageCount <= 0) {
        continue;
      }

      rows0.push({
        id: row.id,
        title: row.title,
        totalImageCount,
        cacheStatus: includes(row.id, cachedRows) ? 'cached' : false,
      });
    }

    rows.value = rows0;
    loading.value = false;
  },
  { immediate: true },
);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>

<style scoped lang="scss"></style>
