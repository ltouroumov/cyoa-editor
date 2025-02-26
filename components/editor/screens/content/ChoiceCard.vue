<template>
  <div class="flex flex-col gap-2 rounded border border-surface-700 p-3">
    <div class="flex flex-row justify-between">
      <ChoiceMove :choice-id="choiceId" :index="index" />
      <div class="flex flex-row gap-2">
        <Button variant="outlined" size="small" severity="secondary">
          Clone
        </Button>
        <Button variant="outlined" size="small" severity="danger">
          Delete
        </Button>
      </div>
    </div>
    <div
      class="flex flex-row items-center cursor-pointer group"
      @click="editChoice()"
    >
      <div class="text-primary text-xl font-bold grow group-hover:underline">
        {{ choice.name }}
      </div>
      <div class="text-surface-500 text-sm">{{ choice.id }}</div>
    </div>
    <div class="flex flex-row gap-2">
      <div>
        <Skeleton
          v-if="isNil(choice.header?.image)"
          width="5rem"
          height="3rem"
          animation="none"
        />
        <ChoiceImage
          v-if="choice.header?.image"
          :media-id="choice.header.image"
          width="5rem"
        />
      </div>
      <div class="flex flex-col gap-2">
        <div class="font-bold">{{ choice.header?.title }}</div>
        <div class="max-h-[10rem] overflow-hidden text-ellipsis">
          {{ choice.header?.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { clone, findIndex, isNil, propEq } from 'ramda';

import ChoiceImage from '~/components/editor/screens/content/choice/ChoiceImage.vue';
import ChoiceMove from '~/components/editor/screens/content/choice/ChoiceMove.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import type {
  ChildObject,
  ChoiceObject,
} from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const props = defineProps<{
  choiceId: string;
  index: number;
}>();

const choice = computed((): ChoiceObject => {
  return projectStore.get(props.choiceId, ObjectType.choice)!;
});

function editChoice() {
  editorStore.pushScreen({
    type: 'edit-choice',
    choiceId: choice.value.id,
  });
}

function moveUp() {
  const parentId: string = projectStore.getParent(choice.value.id)!;
  const childArr: ChildObject[] = clone(projectStore.children.get(parentId)!);

  const childIndex = findIndex(propEq(choice.value.id, 'id'), childArr);
  if (childIndex > 0) {
    const moveArr = childArr.splice(childIndex, 1);
    childArr.splice(childIndex - 1, 0, ...moveArr);
    projectStore.children.set(parentId, childArr);
  }
}

function moveDown() {
  const parentId: string = projectStore.getParent(choice.value.id)!;
  const childArr: ChildObject[] = clone(projectStore.children.get(parentId)!);

  const childIndex = findIndex(propEq(choice.value.id, 'id'), childArr);
  if (childIndex > -1 && childIndex < childArr.length - 1) {
    const moveArr = childArr.splice(childIndex, 1);
    childArr.splice(childIndex + 1, 0, ...moveArr);
    projectStore.children.set(parentId, childArr);
  }
}
</script>

<style scoped lang="scss"></style>
