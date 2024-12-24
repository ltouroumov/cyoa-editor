<template>
  <div class="flex flex-col justify-stretch items-center py-5 h-[100%]">
    <Card class="grow w-[80%]">
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
              <Button color="primary font-medium" @click="doNewProject">
                <i class="pi pi-plus"></i>
                New Project
              </Button>
              <ProjectUpload />
            </div>
          </div>
          <LibraryTable />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import CreateProjectDialog from '~/components/editor/library/CreateProjectDialog.vue';
import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';

const { createEmptyProject } = useEditorLibrary();
const dialog = useDialog();

const doNewProject = async () => {
  dialog.open(CreateProjectDialog, {
    props: {
      modal: true,
      header: 'New Index',
      style: {
        width: '50vw',
      },
    },
    onClose: async (opt: any) => {
      await createEmptyProject(opt.data.name);
    },
  });
};
</script>

<style scoped lang="scss"></style>
