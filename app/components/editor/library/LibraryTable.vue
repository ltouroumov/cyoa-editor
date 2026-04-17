<template>
  <div class="row pt-2">
    <div class="col-12">
      <InputGroup>
        <InputGroupAddon>
          <i class="iconify solar--magnifer-line-duotone"></i>
        </InputGroupAddon>
        <InputText v-model="search" placeholder="Search ..." />
      </InputGroup>
      <DataView :value="projects" data-key="id">
        <template #list="{ items }">
          <div class="flex flex-col">
            <div v-for="(item, index) in items" :key="index">
              <div
                class="flex flex-row gap-3 py-2"
                :class="{
                  'border-t border-surface-200 dark:border-surface-700':
                    index !== 0,
                }"
              >
                <div>
                  <Skeleton width="10rem" height="6rem" animation="none" />
                </div>
                <div class="flex flex-col grow gap-3">
                  <div class="flex flex-row items-start">
                    <div class="flex flex-col grow gap-1">
                      <h2
                        class="text-amber-500 text-2xl bold hover:underline hover:cursor-pointer"
                        @click="doLoad(item.id)"
                      >
                        {{ item.name }}
                      </h2>
                      <span class="text-sm text-surface-500">
                        <span>Last Modified: 2024-01-01</span> /
                        <span>Version: {{ item.currentVersionId }}</span>
                      </span>
                      <div>
                        <Tag>Worm</Tag>
                      </div>
                    </div>
                    <div class="flex flex-row gap-1">
                      <IconButton
                        v-if="item.currentVersionId"
                        severity="secondary"
                        icon="iconify solar--file-download-line-duotone"
                        @click="doDownload(item.id)"
                      />
                      <IconButton
                        severity="secondary"
                        icon="iconify solar--copy-bold-duotone"
                        @click="doClone(item.id)"
                      />
                      <div class="border-l border-surface-700 mx-1"></div>
                      <IconButton
                        severity="danger"
                        icon="iconify solar--trash-bin-trash-linear"
                        @click="doDelete(item.id)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #empty>
          <div class="flex flex-col justify-center items-center">
            <span class="text-xl text-surface-500 my-5">No Projects</span>
          </div>
        </template>
      </DataView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { assoc, includes, isEmpty, isNotNil, omit, pipe } from 'ramda';

import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';
import type { EditorProject } from '~/composables/shared/tables/editor_projects';
import { useDexie } from '~/composables/shared/useDexie';
import { useLiveQuery } from '~/composables/shared/useLiveQuery';

const { loadProject } = useEditorLibrary();
const dexie = useDexie();

const search = ref<string>('');
const projects = useLiveQuery<EditorProject[]>(() => {
  return dexie.editor_projects
    .filter(
      (project) =>
        !project.deleted &&
        (isEmpty(search.value) ||
          includes(search.value.toLowerCase(), project.name.toLowerCase())),
    )
    .toArray();
});

const doLoad = async (id: number) => {
  await loadProject(id);
};

const doDownload = async (id: number) => {
  const project = (await dexie.editor_projects.get(id))!;
  if (project.currentVersionId) {
    const version = (await dexie.editor_projects_versions.get(
      project.currentVersionId,
    ))!;
    const projectData = JSON.stringify(version?.data);
    const projectBlob = new Blob([projectData], { type: 'application/json' });
    const dataURL = URL.createObjectURL(projectBlob);

    const linkEl = document.createElement('a');
    linkEl.style.display = 'none';
    linkEl.download = `project-${version.id}.json`;
    linkEl.href = dataURL;

    document.body.appendChild(linkEl);
    linkEl.click();

    URL.revokeObjectURL(dataURL);
  }
};

const doDelete = async (id: number) => {
  // Soft-delete the project
  await dexie.editor_projects.update(id, (project) => {
    project.deleted = true;
  });
};

const doClone = async (id: number) => {
  const project = await dexie.editor_projects.get(id);
  if (isNotNil(project)) {
    const newProject = pipe(
      omit(['id', 'currentVersionId']),
      assoc('createdAt', new Date()),
      assoc('updatedAt', new Date()),
    )(project);
    await dexie.editor_projects.add(newProject);
  }
};
</script>

<style scoped lang="scss"></style>
