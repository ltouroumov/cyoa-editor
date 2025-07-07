<template>
  <Toolbar
    class="sticky-top sticky top-0 z-50"
    :dt="{ padding: '0.3rem', border: { radius: 0, color: null } }"
    :pt="{
      root: 'grid md:grid-cols-3 md:grid-rows-1 grid-cols-2 grid-rows-2 gap-2',
      center: 'justify-self-center order-3 md:order-2 col-span-2 md:col-span-1',
      start: 'justify-self-start order-1 md:order-1',
      end: 'justify-self-end order-2 md:order-3',
    }"
  >
    <template #start>
      <div class="flex flex-row items-center">
        <Button
          variant="text"
          icon="iconify solar--hamburger-menu-outline"
          severity="contrast"
          :dt="MenuButtonDT"
          :pt="MenuButtonPT"
          @click="toggleProjectMenu()"
        />
      </div>
    </template>
    <template #center>
      <ViewScoreStatus short class="item-scores" />
    </template>
    <template #end>
      <div class="flex gap-1 items-center">
        <Button
          variant="text"
          severity="contrast"
          icon="iconify solar--magnifer-outline"
          :dt="MenuButtonDT"
          :pt="MenuButtonPT"
          @click="toggleSearch()"
        />
        <Button
          variant="text"
          severity="contrast"
          :dt="MenuButtonDT"
          :pt="MenuButtonPT"
          icon="iconify solar--backpack-outline"
          @click="toggleBackpack()"
        />
        <Button
          variant="text"
          severity="contrast"
          :dt="MenuButtonDT"
          :pt="MenuButtonPT"
          icon="iconify solar--notes-outline"
          @click="toggleNotes()"
        />
        <Button
          v-if="hasLoadedBuild"
          variant="text"
          severity="contrast"
          :dt="MenuButtonDT"
          :pt="MenuButtonPT"
          icon="iconify solar--diskette-outline"
          @click="updateCurrentBuild($event)"
        />
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { isNotNil } from 'ramda';

import ViewScoreStatus from '~/components/viewer/ViewScoreStatus.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerStore } from '~/composables/store/viewer';
import { useBuildLibrary } from '~/composables/viewer/useBuildLibrary';

const { toggleBackpack, toggleSearch, toggleProjectMenu, toggleNotes } =
  useViewerStore();
const { buildData, buildModified } = useProjectRefs();
const $lib = useBuildLibrary();
const $confirm = useConfirm();
const $toast = useToast();

const MenuButtonDT = {
  padding: { x: '0.25rem', y: '0.25rem' },
  border: { radius: '0.10rem' },
};
const MenuButtonPT = {
  icon: { class: 'size-5' },
};

const hasLoadedBuild = computed(() => {
  return isNotNil(buildData.value);
});

const updateCurrentBuild = async ($event: any) => {
  if (isNotNil(buildData.value)) {
    $confirm.require({
      target: $event.currentTarget,
      message: 'Overwrite your saved build?',
      icon: 'pi pi-exclamation-triangle',
      group: 'popup',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: 'Save',
      },
      accept: async () => {
        await $lib.updateBuild(buildData.value!);
        buildModified.value = false;
        $toast.add({
          severity: 'info',
          summary: `Build Updated ${buildData.value!.name}`,
          life: 1000,
        });
      },
    });
  }
};
</script>

<style scoped lang="scss"></style>
