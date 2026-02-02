<template>
  <div class="flex flex-col gap-2">
    <CacheOperations
      :cache-operations="cacheOperations"
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
          >
            Remote
          </span>
          <span
            v-else-if="project.source === 'cached'"
            class="font-bold text-indigo-500"
          >
            Cached
          </span>
        </div>
      </div>
      <div class="flex flex-row gap-2 items-center">
        <div class="grow flex flex-col items-start gap-1">
          <span class="text-xl">Project</span>
          <span v-if="isNotNil(rows)" class="text-sm text-surface-400">
            Sections: {{ rows.totalRows }} ({{
              formatBytes(rows.projectFileSize)
            }})
          </span>
        </div>

        <div v-if="project.source === 'remote'">
          <Button
            :disabled="hasActiveOperation(project.id, 'project')"
            @click="
              cacheProject(project.id, {
                images: false,
                project: true,
                mode: 'refresh-missing',
              })
            "
          >
            <span class="iconify solar--cloud-download-linear sm:mr-2"></span>
            <span class="hidden sm:inline">Download</span>
          </Button>
        </div>
        <div
          v-if="project.source === 'cached' || project.source === 'local'"
          class="flex flex-row gap-2 justify-end"
        >
          <SplitButton
            v-if="project.source === 'cached'"
            label="Update"
            icon="iconify solar--refresh-linear"
            :model="[
              {
                label: 'Delete',
                icon: 'iconify solar--trash-bin-trash-linear',
                class: 'text-red-500',
                command: (event: CommandEvent) => {
                  if (project) {
                    tryClearCache(
                      project.id,
                      { project: true },
                      event.originalEvent,
                    );
                  }
                },
              },
            ]"
            @click="
              cacheProject(project.id, {
                mode: 'refresh-all',
                images: false,
                project: true,
              })
            "
          >
            <span class="iconify solar--refresh-linear sm:mr-2"></span>
            <span class="hidden sm:inline">Update</span>
          </SplitButton>
          <Button
            v-else
            severity="danger"
            :disabled="hasActiveOperation(project.id, 'project')"
            @click="tryClearCache(project.id, { project: true }, $event)"
          >
            <span class="iconify solar--trash-bin-trash-linear sm:mr-2"></span>
            <span class="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
      <div class="w-full border-t border-surface-700 my-2"></div>
      <div class="flex flex-row gap-2 items-start">
        <div class="grow flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <div class="flex flex-row items-center gap-2">
              <span class="text-xl">Images</span>
            </div>

            <div v-if="isNotNil(rows)" class="flex flex-col gap-1">
              <div class="text-sm text-surface-400">
                Cached: {{ rows.totalImagesCached }} /
                {{ rows.totalImages }} ({{ formatBytes(rows.totalImagesSize) }})
              </div>
            </div>
          </div>
          <div class="flex flex-col">
            <div
              v-if="project.source !== 'remote'"
              class="text-sm text-surface-400"
            >
              {{ downloadButtonConfig.statusMode }}
            </div>
            <div
              v-if="downloadButtonConfig.statusInfo"
              class="text-sm text-surface-400"
            >
              {{ downloadButtonConfig.statusInfo }}
            </div>
          </div>
        </div>

        <div class="flex flex-row gap-2 justify-between items-center">
          <div class="flex flex-col gap-2 justify-end">
            <div class="flex flex-row gap-2 justify-end">
              <SplitButton
                v-if="downloadButtonConfig.model.length > 0"
                :model="downloadButtonConfig.model"
                :disabled="
                  hasActiveOperation(project.id, 'images') ||
                  project.source === 'remote'
                "
                @click="downloadButtonConfig.command"
              >
                <span
                  class="iconify sm:mr-2"
                  :class="downloadButtonConfig.icon"
                ></span>
                <span class="hidden sm:inline">{{
                  downloadButtonConfig.label
                }}</span>
              </SplitButton>
              <Button
                v-else
                :disabled="
                  hasActiveOperation(project.id, 'images') ||
                  project.source === 'remote'
                "
                @click="downloadButtonConfig.command"
              >
                <span
                  class="iconify sm:mr-2"
                  :class="downloadButtonConfig.icon"
                ></span>
                <span class="hidden sm:inline">{{
                  downloadButtonConfig.label
                }}</span>
              </Button>
            </div>

            <div class="flex flex-row gap-2 items-center">
              <Checkbox
                v-model="showImagesAdvanced"
                :binary="true"
                input-id="images-advanced-mode"
                :disabled="project.source === 'remote'"
              />
              <label
                for="images-advanced-mode"
                :class="{ 'text-surface-500': project.source === 'remote' }"
              >
                Advanced Mode
              </label>
            </div>
          </div>
        </div>
      </div>
      <ImageCache
        v-if="isNotNil(project) && isNotNil(projectData) && showImagesAdvanced"
        v-model:selection="selectedRows"
        class="mt-2"
        :project="project"
        :project-data="projectData!"
        :active-operations="cacheOperations"
        @cache="cacheProject"
        @clear="clearCache"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';
import SplitButton from 'primevue/splitbutton';
import { useConfirm } from 'primevue/useconfirm';
import { find, isNil, isNotNil, propEq } from 'ramda';

import CacheOperations from '~/components/viewer/menu/CacheOperations.vue';
import type { Project } from '~/composables/project/types/v1';
import type { CacheItem } from '~/composables/shared/tables/viewer_projects';
import { isCacheable } from '~/composables/utils/url';
import type { ClearOptions } from '~/composables/viewer/cache/types';
import { formatBytes } from '~/composables/viewer/cache/utils';
import type { RowInfo } from '~/composables/viewer/types';
import { useViewerLibrary } from '~/composables/viewer/useViewerLibrary';

const $confirm = useConfirm();
const $dialog: Ref = inject('dialogRef')!;
const showImagesAdvanced = ref<boolean>(false);

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

watch(project, (p) => {
  if (!p) {
    $dialog.value.close();
  }
});

const projectFileSize = ref<number>(0);

const projectData = computedAsync(async () => {
  if (!project.value) return null;
  if (project.value.source === 'remote') return null;

  const fileContents = await loadCachedData(project.value);
  projectFileSize.value = fileContents.length;
  return JSON.parse(fileContents) as Project;
});

const projectStats = computedAsync(async () => {
  if (isNil(projectData.value) || isNil(project.value)) return null;

  let totalRows = 0;
  let totalImages = 0;
  for (const row of projectData.value.rows) {
    totalRows++;

    if (isCacheable(row.image)) {
      totalImages++;
    }
    for (const obj of row.objects) {
      if (isCacheable(obj.image)) {
        totalImages++;
      }

      for (const addon of obj.addons) {
        if (isCacheable(addon.image)) {
          totalImages++;
        }
      }
    }
  }

  return { totalRows, totalImages, projectFileSize: projectFileSize.value };
}, null);

const rows = computed(() => {
  if (!project.value || !projectStats.value) return null;

  const cachedItems: CacheItem[] = project.value.cachedItems ?? [];
  const totalImagesCached = cachedItems.reduce((acc, item) => {
    if (item.type === 'images.row') return acc + item.count;
    else return acc;
  }, 0);

  const totalImagesSize = cachedItems.reduce((acc, item) => {
    if (item.type === 'images.row') return acc + (item.size ?? 0);
    else return acc;
  }, 0);

  return {
    ...projectStats.value,
    totalImagesCached,
    totalImagesSize,
  };
});

const tryClearCache = async (
  id: string,
  options: ClearOptions,
  $event: any,
) => {
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
      await clearCache(id, options);
    },
  });
};

type CommandEvent = {
  originalEvent: Event;
  item: MenuItem;
};

const selectedRows = ref<RowInfo[]>([]);

const globalStats = computed(() => {
  if (!rows.value) return { total: 0, cached: 0 };
  return {
    total: rows.value.totalImages,
    cached: rows.value.totalImagesCached,
  };
});

const selectionStats = computed(() => {
  if (selectedRows.value.length === 0) return { total: 0, cached: 0 };

  const total = selectedRows.value.reduce(
    (acc, r) => acc + (r.totalImageCount || 0),
    0,
  );

  const cachedMap = (project.value?.cachedItems ?? []).reduce(
    (acc, item) => {
      if (item.type === 'images.row') acc[item.rowId] = item.count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const cached = selectedRows.value.reduce(
    (acc, r) => acc + (cachedMap[r.id] ?? 0),
    0,
  );

  return { total, cached };
});

const effectiveStats = computed(() => {
  const isSelection = selectedRows.value.length > 0;
  return isSelection ? selectionStats.value : globalStats.value;
});

const getTargetIds = () => {
  return selectedRows.value.length > 0
    ? selectedRows.value.map((r) => r.id)
    : true;
};

// Actions
const doDownloadMissing = () => {
  if (!project.value) return;
  cacheProject(project.value.id, {
    images: getTargetIds(),
    project: false,
    mode: 'refresh-missing',
  });
};

const doForceRefresh = () => {
  if (!project.value) return;
  cacheProject(project.value.id, {
    images: getTargetIds(),
    project: false,
    mode: 'refresh-existing', // or refresh-all based on context, keeping logic consistent
  });
};

const doUpdate = () => {
  if (!project.value) return;
  cacheProject(project.value.id, {
    images: getTargetIds(),
    project: false,
    mode: 'refresh-all',
  });
};

const doDeleteLogic = (event: CommandEvent) => {
  if (!project.value) return;
  tryClearCache(
    project.value.id,
    { images: getTargetIds() },
    event.originalEvent,
  );
};

const downloadButtonConfig = computed(() => {
  const proj = project.value;
  if (!proj) return { label: '', model: [] };

  const { total, cached } = effectiveStats.value;
  const isPartial = cached < total || total === 0;
  const isSelection = selectedRows.value.length > 0;

  // Generate Info Text
  const parts: string[] = [];
  if (isSelection) {
    parts.push(`Selected: ${selectedRows.value.length} Rows`);
    if (isPartial) parts.push(`(${total - cached} Images to Download)`);
    else parts.push(`(${total} Images)`);
  }

  const infoText = parts.join(' ');

  if (isPartial) {
    // "Download Missing" Mode
    return {
      label: 'Download',
      statusInfo: infoText,
      statusMode: 'Cache Mode: Download Missing',
      icon: 'iconify solar--cloud-download-linear',
      command: doDownloadMissing,
      model:
        cached > 0
          ? [
              {
                label: 'Force Refresh',
                icon: 'iconify solar--refresh-linear',
                command: doForceRefresh,
              },
              { separator: true },
              {
                label: 'Delete',
                icon: 'iconify solar--trash-bin-trash-linear',
                severity: 'danger',
                class: 'text-red-500',
                command: doDeleteLogic,
              },
            ]
          : [],
    };
  } else {
    // "Update" Mode (Complete)
    return {
      label: 'Update',
      statusInfo: infoText,
      statusMode: 'Cache Mode: Force Refresh',
      icon: 'iconify solar--refresh-linear',
      command: doUpdate,
      model: [
        {
          label: 'Delete',
          icon: 'iconify solar--trash-bin-trash-linear',
          class: 'text-red-500',
          command: doDeleteLogic,
        },
      ],
    };
  }
});
</script>

<style scoped lang="scss"></style>
