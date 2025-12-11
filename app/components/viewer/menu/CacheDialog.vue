<template>
  <div class="flex flex-col gap-2">
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
    <div class="flex flex-col gap-2">
      <Message
        v-if="cacheOperation.status === 'running'"
        severity="info"
        class="mt-2"
      >
        <div class="flex flex-row items-center gap-1 w-full">
          <ProgressSpinner class="size-4" />
          <div class="grow w-full">
            {{ cacheOperation.progress ?? 'Running ...' }}
          </div>
        </div>
      </Message>
      <Message
        v-if="cacheOperation.status === 'completed'"
        severity="success"
        class="mt-2"
        closable
      >
        Cache operation completed.
      </Message>
      <Message
        v-if="cacheOperation.status === 'cancelled'"
        severity="warn"
        class="mt-2"
        closable
      >
        Cache operation cancelled.
      </Message>
      <Message
        v-if="cacheOperation.status === 'failure'"
        severity="error"
        class="mt-2"
        closable
      >
        Cache operation failed.
      </Message>
    </div>
    <div class="min-h-[400px] relative overflow-y-auto">
      <div
        v-if="isEmpty(rows)"
        class="absolute top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center"
      >
        <div class="text-surface-600 italic">No project data ...</div>
      </div>
      <DataTable v-else :value="rows" :paginator="true" :rows="8">
        <Column field="title" header="Title" />
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { find, isEmpty, propEq } from 'ramda';

import type { Project, ProjectRow } from '~/composables/project/types/v1';
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

const project = computed(() => {
  return find(propEq($dialog.value.data.projectId, 'id'), projectList.value);
});

const rows = computedAsync(async () => {
  if (!project.value) return [];
  if (project.value.source === 'remote') return [];

  const fileContents = await loadCachedData(project.value);
  const fileData = JSON.parse(fileContents) as Project;

  return fileData.rows.map((row: ProjectRow) => {
    return { id: row.id, title: row.title };
  });
}, []);

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
