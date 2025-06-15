<template>
  <div class="build-details">
    <div class="name">
      <BuildName :name="build.name" class="me-2" @change="updateBuildName" />
    </div>
    <template v-if="build.selected">
      <div class="actions">
        <Button size="small" @click="loadBuild()"> Load </Button>
        <button size="small" severity="danger" @click="deleteBuild($event)">
          Delete
        </button>
      </div>
      <div v-if="build.selected" class="choices">
        {{ buildCode(build.selected) }}
      </div>
    </template>
    <template v-else>
      <div class="project-name">
        <span v-if="isCompatible === ProjectMatch.Hash" class="compat">
          <div
            class="iconify solar--check-circle-outline h-1em w-1em text-green-500"
          ></div>
        </span>
        <span v-if="isCompatible === ProjectMatch.Name" class="compat">
          <div
            class="iconify solar--check-circle-outline h-1em w-1em text-orange-500"
          ></div>
        </span>
        <span v-if="isCompatible === ProjectMatch.None" class="compat">
          <div
            class="iconify solar--danger-triangle-bold text-red-500 h-1em w-1em"
          ></div>
        </span>
        <span class="flex-grow-1">{{ build.project.name }}</span>
      </div>
      <div class="date">
        <span>{{ build.updatedAt.toLocaleDateString() }}</span>
      </div>
      <div class="choices">
        <div class="choices-header">
          <div>Choices</div>
          <div>
            <Button
              size="small"
              variant="text"
              severity="secondary"
              @click="toggleChoices"
            >
              <div
                v-if="showChoices"
                class="iconify solar--alt-arrow-down-linear h-1em w-1em"
              ></div>
              <div
                v-if="!showChoices"
                class="iconify solar--alt-arrow-right-linear h-1em w-1em"
              ></div>
            </Button>
          </div>
        </div>
        <BuildChoices v-show="showChoices" :groups="build.groups" />
      </div>
      <div class="actions">
        <Button size="small" variant="outlined" @click="loadBuild()">
          Load
        </Button>
        <Button size="small" variant="outlined" @click="updateBuild($event)">
          Save
        </Button>
        <Button
          size="small"
          variant="outlined"
          severity="danger"
          @click="deleteBuild($event)"
        >
          Delete
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import * as R from 'ramda';
import { isNotEmpty, join, map, toPairs } from 'ramda';

import BuildChoices from '~/components/viewer/library/BuildChoices.vue';
import { ProjectMatch } from '~/components/viewer/utils/types';
import type { SavedBuildData } from '~/composables/shared/tables/builds';
import { type Selections, useProjectRefs } from '~/composables/store/project';
import { useBuildLibrary } from '~/composables/viewer/useBuildLibrary';

const { selected, project } = useProjectRefs();
const $confirm = useConfirm();
const $toast = useToast();

const $props = defineProps<{
  build: SavedBuildData;
}>();
const $emit = defineEmits<{
  (e: 'change'): void;
}>();

const showChoices = ref<boolean>(false);

const toggleChoices = () => {
  showChoices.value = !showChoices.value;
};

const buildCode = (selected: Selections) =>
  join(
    ';',
    map(([id, amt]) => (amt > 1 ? `${id}:${amt}` : id), toPairs(selected)),
  );

const isCompatible = computed(() => {
  const _project = project.value;
  if (!_project) return false;

  if (
    _project.projectId === $props.build.project.projectId ||
    _project.projectHash === $props.build.project.hash
  ) {
    return ProjectMatch.Hash;
  } else if (_project.projectName === $props.build.project.name) {
    return ProjectMatch.Name;
  } else {
    return ProjectMatch.None;
  }
});

const $lib = useBuildLibrary();

const updateBuild = async ($event: any) => {
  if (R.isEmpty(selected.value)) {
    // $toast.error("No selections are made,\nThere's nothing to save.");
    return;
  }

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
      await $lib.updateBuild($props.build, { $choices: true, $notes: true });
      $toast.add({
        severity: 'info',
        summary: `Build Updated ${$props.build.name}`,
        life: 1000,
      });
      $emit('change');
    },
  });
};

const updateBuildName = async (name: string) => {
  await $lib.updateBuild($props.build, { name: name });
  $emit('change');
};

const deleteBuild = async ($event: any) => {
  $confirm.require({
    target: $event.currentTarget,
    message: 'Delete your saved build?',
    icon: 'pi pi-exclamation-triangle',
    group: 'popup',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
    },
    accept: async () => {
      await $lib.deleteBuild($props.build);
      $emit('change');
      $toast.add({
        severity: 'success',
        summary: `Build Deleted ${$props.build.name}`,
        life: 1000,
      });
    },
  });
};

const loadBuild = () => {
  if (isNotEmpty(selected.value)) {
    $confirm.require({
      header: 'Load this build?',
      message: 'There are choices already selected.',
      icon: 'pi pi-exclamation-triangle',
      group: 'modal',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: 'Load Build',
      },
      accept: async () => {
        $lib.loadBuild($props.build);
        $toast.add({
          severity: 'info',
          summary: `Build Loaded ${$props.build.name}`,
          life: 1000,
        });
      },
    });
  } else {
    $lib.loadBuild($props.build);
    $toast.add({
      severity: 'info',
      summary: `Build Loaded ${$props.build.name}`,
      life: 1000,
    });
  }
};
</script>

<style scoped lang="scss">
.build-details {
  display: grid;
  grid-template:
    'name actions' auto
    'pname actions' auto
    'date actions' auto
    'choices choices' auto
    / 1fr auto;

  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--p-content-border-color);

  .name {
    grid-area: name;
    font-size: 1.25em;
    font-weight: bold;
  }

  .project-name {
    grid-area: pname;

    display: flex;
    flex-direction: row;
    gap: 0.2rem;
    align-items: center;
  }

  .date {
    grid-area: date;
    font-style: italic;
    color: gray;
  }

  .choices {
    grid-area: choices;

    padding-top: 0.5rem;
    border-top: 1px solid var(--p-content-border-color);

    .choices-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }

  .actions {
    grid-area: actions;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .build-code {
    grid-area: choices;
  }
}
</style>
