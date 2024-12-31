<template>
  <div class="flex flex-col gap-2 rounded border border-surface-700 p-3">
    <div class="flex flex-row justify-between">
      <div class="flex flex-row gap-2">
        <IconButton
          outlined
          severity="secondary"
          icon="iconify solar--arrow-left-line-duotone"
        />
        <IconButton
          outlined
          severity="secondary"
          icon="iconify solar--arrow-right-line-duotone"
        />
      </div>
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
      @click="editAddon()"
    >
      <div class="text-primary text-xl font-bold grow group-hover:underline">
        {{ addon.name }}
      </div>
      <div class="text-surface-500 text-sm">{{ addon.id }}</div>
    </div>
    <div class="flex flex-row gap-2">
      <div>
        <Skeleton
          v-if="isNil(addon.header?.image)"
          width="5rem"
          height="3rem"
          animation="none"
        />
        <ChoiceImage
          v-if="addon.header?.image"
          :media-id="addon.header.image"
          width="5rem"
        />
      </div>
      <div class="flex flex-col gap-2">
        <div class="font-bold">{{ addon.header?.title }}</div>
        <div class="max-h-[10rem] overflow-hidden text-ellipsis">
          {{ addon.header?.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNil } from 'ramda';

import ChoiceImage from '~/components/editor/screens/content/ChoiceImage.vue';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import type { AddonObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const props = defineProps<{
  addonId: string;
}>();

const addon = computed((): AddonObject => {
  return projectStore.get(props.addonId, ObjectType.addon)!;
});

function editAddon() {
  editorStore.pushScreen({
    type: 'edit-addon',
    choiceId: addon.value.id,
  });
}
</script>

<style scoped lang="scss"></style>
