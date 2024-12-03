<template>
  <Card>
    <template #content>
      <div class="container-fluid">
        <div class="row">
          <div class="col-8">
            <h1
              class="text-primary text-3xl font-bold flex flex-row gap-1 items-center"
            >
              <span>Interactive CYOA Creator</span>
              <span class="text-slate-500 text-base font-light">(beta)</span>
            </h1>
          </div>
          <div class="col-4 flex flex-row gap-2 justify-end">
            <Button color="primary font-medium">
              <i class="pi pi-plus"></i>
              New Project
            </Button>
            <ProjectUpload v-if="store.status === 'empty'" />
            <ProgressSpinner v-if="store.status === 'loading'" />
          </div>
        </div>
        <div class="row pt-2">
          <div :class="showSidebar ? ['col-8'] : ['col-12']">
            <InputGroup>
              <InputGroupAddon>
                <i class="iconify solar--magnifer-line-duotone"></i>
              </InputGroupAddon>
              <InputText placeholder="Search ..." />
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
                              {{ item.title }}
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
                            />
                            <Button
                              severity="secondary"
                              size="small"
                              icon="iconify solar--copy-bold-duotone"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </DataView>
          </div>
          <div v-if="showSidebar" class="col-4"></div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useProjectRefs } from '~/composables/store/project';

const { store, project } = useProjectRefs();

const showSidebar = ref<boolean>(false);
const projects = ref<any[]>([
  { id: 1, title: 'Worm CYOA' },
  { id: 1, title: 'Pathfinder CYOA' },
]);
</script>

<style scoped lang="scss"></style>
