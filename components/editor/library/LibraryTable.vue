<template>
  <div class="row pt-2">
    <div :class="showSidebar ? ['col-8'] : ['col-12']">
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
                  <Skeleton size="5rem" animation="none" />
                </div>
                <div class="flex flex-col grow gap-3">
                  <div class="flex flex-row">
                    <div class="flex flex-col grow gap-1">
                      <h2
                        class="text-amber-500 text-2xl bold hover:underline hover:cursor-pointer"
                      >
                        {{ item.name }}
                      </h2>
                      <span class="text-sm text-surface-500">
                        Last Modified: 2024-01-01
                      </span>
                      <div>
                        <Tag>Worm</Tag>
                      </div>
                    </div>
                    <div class="flex flex-row gap-1 items-start">
                      <Button
                        severity="danger"
                        size="small"
                        icon="iconify solar--trash-bin-trash-linear"
                        @click="doDelete(item.id)"
                      />
                      <Button
                        severity="secondary"
                        size="small"
                        icon="iconify solar--copy-bold-duotone"
                        @click="doClone(item.id)"
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
    <div v-if="showSidebar" class="col-4"></div>
  </div>
</template>
<script setup lang="ts">
import { useObservable } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';
import { assoc, includes, isEmpty, isNotNil, omit, pipe } from 'ramda';
import { from } from 'rxjs';

import type { EditorProject } from '~/composables/shared/tables/projects';
import { useDexie } from '~/composables/shared/useDexie';

const dexie = useDexie();

const showSidebar = ref<boolean>(false);
const search = ref<string>('');
const projects = useObservable<EditorProject[]>(
  from(
    liveQuery(() => {
      return dexie.projects
        .filter(
          (project) =>
            !project.deleted &&
            (isEmpty(search.value) ||
              includes(search.value.toLowerCase(), project.name.toLowerCase())),
        )
        .toArray();
    }),
  ),
);

const doDelete = async (id: number) => {
  // Soft-delete the project
  await dexie.projects.update(id, (project) => {
    project.deleted = true;
  });
};

const doClone = async (id: number) => {
  // Soft-delete the project
  const project = await dexie.projects.get(id);
  if (isNotNil(project)) {
    const newProject = pipe(
      omit(['id', 'currentVersionId']),
      assoc('createdAt', new Date()),
      assoc('updatedAt', new Date()),
    )(project);
    await dexie.projects.add(newProject);
  }
};
</script>

<style scoped lang="scss"></style>
