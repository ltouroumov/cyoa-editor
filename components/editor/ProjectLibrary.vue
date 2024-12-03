<template>
  <Card>
    <template #content>
      <Card class="col col-6">
        <template #content>
          <div class="container-fluid">
            <div class="row">
              <div class="col-8">
                <h1 class="text-primary">
                  Interactive CYOA Creator
                  <span class="text-secondary"></span>
                </h1>
              </div>
              <div class="col-4">
                <Button>New Project</Button>
                <ProjectUpload v-if="store.status === 'empty'" />
                <ProgressSpinner v-if="store.status === 'loading'" />
              </div>
            </div>
            <div class="row">
              <div class="col-8"></div>
              <div class="col-4"></div>
            </div>
          </div>
        </template>
      </Card>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useProjectRefs } from '~/composables/store/project';

const { store, project } = useProjectRefs();
</script>

<style scoped lang="scss"></style>
