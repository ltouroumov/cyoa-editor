<template>
  <div class="min-h-[400px] relative">
    <DataTable
      v-model:filters="filters"
      v-model:selection="selectedRows"
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
      <Column selection-mode="multiple" header-style="width: 3rem"></Column>
      <Column field="title" header="Section">
        <template #body="{ data }">
          <div class="flex flex-row gap-2 items-center">
            <span>{{ data.title }}</span>
            <span class="text-surface-600 text-sm">{{ data.id }}</span>
          </div>
        </template>
      </Column>
      <Column field="totalImageCount" header="Images">
        <template #body="{ data }">
          {{ data.cachedImageCount }} / {{ data.totalImageCount }}
        </template>
      </Column>
      <Column field="cacheStatus" header="Status">
        <template #body="{ data }">
          <Badge v-if="data.cacheStatus === false" severity="secondary">
            Not Cached
          </Badge>
          <Badge v-if="data.cacheStatus === 'partial'" severity="warning">
            Partial
          </Badge>
          <Badge v-if="data.cacheStatus === 'cached'" severity="info">
            Cached
          </Badge>
        </template>
      </Column>
      <Column field="cachedImageSize" header="Size">
        <template #body="{ data }">
          {{ formatBytes(data.cachedImageSize) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { ref, watch } from 'vue';

import type { Project } from '~/composables/project/types/v1';
import { isCacheable } from '~/composables/utils/url';
import type {
  CacheOptions,
  ClearOptions,
} from '~/composables/viewer/cache/types';
import { formatBytes } from '~/composables/viewer/cache/utils';
import type { ProjectListEntry, RowInfo } from '~/composables/viewer/types';
import type { CacheOperation } from '~/composables/viewer/useViewerLibrary';

const $props = defineProps<{
  project: ProjectListEntry;
  projectData: Project;
  activeOperations: CacheOperation[];
}>();

// Define model for selection
const selectedRows = defineModel<RowInfo[]>('selection', { default: [] });

const $emit = defineEmits<{
  (e: 'cache', projectId: string, options: CacheOptions): void;
  (e: 'clear', projectId: string, options: ClearOptions): void;
}>();

const rows = ref<RowInfo[]>([]);
const loading = ref<boolean>(true);

watch(
  [() => $props.project, () => $props.projectData],
  async () => {
    if ($props.project.source === 'remote') return [];

    loading.value = true;
    await nextTick();

    const fileData = $props.projectData;

    const cachedRows = ($props.project.cachedItems ?? []).reduce(
      (acc, item) => {
        if (item.type === 'images.row') {
          acc[item.rowId] = { count: item.count, size: item.size };
        }
        return acc;
      },
      {} as Record<string, { count: number; size: number }>,
    );

    const nextRows: RowInfo[] = [];
    for (const row of fileData.rows) {
      let totalImageCount = 0;
      if (isCacheable(row.image)) {
        totalImageCount += 1;
      }
      for (const obj of row.objects) {
        if (isCacheable(obj.image)) {
          totalImageCount += 1;
        }
        for (const addon of obj.addons) {
          if (isCacheable(addon.image)) {
            totalImageCount += 1;
          }
        }
      }

      if (totalImageCount <= 0) {
        continue;
      }

      const cachedInfo = cachedRows[row.id] ?? { count: 0, size: 0 };
      const cachedCount = cachedInfo.count;

      nextRows.push({
        id: row.id,
        title: row.title,
        totalImageCount,
        cachedImageCount: cachedCount,
        cachedImageSize: cachedInfo.size,
        cacheStatus:
          cachedCount === 0
            ? false
            : cachedCount >= totalImageCount
              ? 'cached'
              : 'partial',
      });
    }

    rows.value = nextRows;
    loading.value = false;
  },
  { immediate: true },
);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>

<style scoped lang="scss"></style>
