<template>
  <div class="build-details">
    <div class="name">{{ build.name }}</div>
    <template v-if="build.selected">
      <div class="actions">
        <button
          class="btn btn-outline-primary btn-sm"
          @click="loadBuild(build)"
        >
          Load
        </button>
        <button
          class="btn btn-sm btn-outline-danger"
          @click="deleteBuild(build)"
        >
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
            class="i-solar:check-circle-outline h-1em w-1em text-green"
          ></div>
        </span>
        <span v-if="isCompatible === ProjectMatch.Name" class="compat">
          <div
            class="i-solar:check-circle-outline h-1em w-1em text-orange"
          ></div>
        </span>
        <span v-if="isCompatible === ProjectMatch.None" class="compat">
          <div
            class="i-solar:danger-triangle-bold text-danger h-1em w-1em"
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
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="toggleChoices"
            >
              <div
                v-if="showChoices"
                class="i-solar:alt-arrow-down-linear h-1em w-1em"
              ></div>
              <div
                v-if="!showChoices"
                class="i-solar:alt-arrow-right-linear h-1em w-1em"
              ></div>
            </button>
          </div>
        </div>
        <BuildChoices v-show="showChoices" :groups="build.groups" />
      </div>
      <div class="actions">
        <button
          class="btn btn-outline-primary btn-sm"
          @click="loadBuild(build)"
        >
          Load
        </button>
        <button
          class="btn btn-outline-primary btn-sm"
          @click="updateBuild(build)"
        >
          Save
        </button>
        <button
          class="btn btn-sm btn-outline-danger"
          @click="deleteBuild(build)"
        >
          Delete
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { join, map, toPairs } from 'ramda';
import { useToast } from 'vue-toastification';

import BuildChoices from '~/components/viewer/utils/BuildChoices.vue';
import {
  ProjectMatch,
  type SavedBuildData,
} from '~/components/viewer/utils/types';
import { type Selections, useProjectRefs } from '~/composables/store/project';
import { useBuildLibrary } from '~/composables/viewer/useBuildLibrary';

const { selected, project } = useProjectRefs();
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

const updateBuild = async (build: SavedBuildData) => {
  if (R.isEmpty(selected.value)) {
    $toast.error("No selections are made,\nThere's nothing to save.");
    return;
  }

  await $lib.updateBuild(build);
  $emit('change');
  $toast.success(`Updated Build: ${build.name}`);
};

const deleteBuild = async (build: SavedBuildData) => {
  await $lib.deleteBuild(build);
  $emit('change');
  $toast.success(`Deleted Build: ${build.name}`);
};

const loadBuild = (build: SavedBuildData) => {
  $lib.loadBuild(build);
  $toast.info(`Loaded Build: ${build.name}`);
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
  border: 1px solid var(--bs-border-color);

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
    border-top: 1px solid var(--bs-border-color);

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
