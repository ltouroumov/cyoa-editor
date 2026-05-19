<template>
  <IconButton
    severity="secondary"
    variant="outlined"
    size="small"
    icon="iconify solar--menu-dots-bold-duotone"
    @click="openMenu($event)"
  />
  <Menu ref="menu" :model="menuItems" :popup="true">
    <template #item="{ item }">
      <a
        class="px-2 py-1 flex items-center gap-1 cursor-pointer"
        :class="item.class"
      >
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';
import { filter } from 'ramda';
import { match } from 'ts-pattern';

import { ObjectTypeNames } from '~/composables/editor/const';
import { useProjectWriter } from '~/composables/editor/useProjectWriter';
import { EntityType } from '~/composables/project/types/v2/base';
import type { AnyObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectClipboard } from '~/composables/project/useProjectClipboard';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $confirm = useConfirm();

const projectStore = useProjectStore();
const projectWriter = useProjectWriter();
const clipboardUtils = useProjectClipboard();

const props = defineProps<{
  objectId: string;
  type: EntityType;
}>();

const entity = computed(() => {
  return match(props.type)
    .with(EntityType.Object, () => projectStore.getObject(props.objectId))
    .with(EntityType.Score, () => projectStore.scores.get(props.objectId))
    .with(EntityType.Image, () => projectStore.media.images[props.objectId])
    .with(EntityType.Style, () => projectStore.styles.rules[props.objectId])
    .exhaustive();
});

const isTypes = (...types: EntityType[]) => types.includes(props.type);

const isTypesWhen = (
  types: Partial<Record<EntityType, boolean | ((entity: any) => boolean)>>,
): boolean => {
  if (props.type in types) {
    const typeMatcher = types[props.type]!;
    if (typeof typeMatcher === 'boolean') {
      return typeMatcher;
    } else {
      return typeMatcher(entity.value);
    }
  } else {
    return false;
  }
};

const menu = ref();
const menuItems: ComputedRef<MenuItem[]> = computed((): MenuItem[] => {
  return filter(
    (item) => !item.disabled,
    [
      {
        label: 'Clone',
        icon: 'iconify solar--copy-line-duotone',
        command: () => cloneObject(),
        disabled: !isTypesWhen({
          [EntityType.Object]: (obj) => obj.type !== ObjectType.page,
          [EntityType.Score]: true,
        }),
      },
      {
        label: 'Move',
        icon: 'iconify solar--arrow-right-up-line-duotone',
        command: () => moveObject(),
        disabled: !isTypesWhen({
          [EntityType.Object]: (obj) => obj.type !== ObjectType.page,
        }),
      },
      {
        label: 'Copy',
        icon: 'iconify solar--clipboard-text-line-duotone',
        command: () => copyObject(),
      },
      {
        label: 'Cut',
        icon: 'iconify solar--scissors-line-duotone',
        command: () => cutObject(),
      },
      { separator: true },
      {
        label: 'Delete',
        icon: 'iconify solar--trash-bin-trash-line-duotone',
        class: 'text-red-400',
        command: () => deleteObject(),
      },
    ],
  );
});

const openMenu = ($event: any) => {
  menu.value.toggle($event);
};

function cloneObject() {
  match(props.type)
    .with(EntityType.Object, () => {
      console.log('Clone Object command triggered');
    })
    .with(EntityType.Score, () => {
      console.log('Clone Score command triggered');
    })
    .otherwise(() => {
      console.error(`Clone command not supported for ${props.type}`);
    });
}

function moveObject() {
  match(props.type)
    .with(EntityType.Object, () => {
      console.log('Move Object command triggered');
    })
    .otherwise(() => {
      console.error(`Move command not supported for ${props.type}`);
    });
}

function copyObject() {
  match(props.type)
    .with(EntityType.Object, () => {
      const parentId = projectStore.getParent(props.objectId);
      clipboardUtils.copyObject(props.objectId, parentId);
    })
    .with(EntityType.Score, () => {
      clipboardUtils.copyScore(props.objectId);
    })
    .with(EntityType.Image, () => {
      console.log('Copy Image command triggered');
    })
    .with(EntityType.Style, () => {
      console.log('Copy Style command triggered');
    })
    .exhaustive();
}

function cutObject() {
  match(props.type)
    .with(EntityType.Object, () => {
      console.log('Cut Object command triggered');
    })
    .with(EntityType.Score, () => {
      console.log('Cut Score command triggered');
    })
    .with(EntityType.Image, () => {
      console.log('Cut Image command triggered');
    })
    .with(EntityType.Style, () => {
      console.log('Cut Style command triggered');
    })
    .exhaustive();
}

function deleteObject() {
  const entityName = match(props.type)
    .with(
      EntityType.Object,
      () => ObjectTypeNames[(entity.value as AnyObject).type],
    )
    .with(EntityType.Score, () => 'Score')
    .with(EntityType.Image, () => 'Image')
    .with(EntityType.Style, () => 'Style')
    .exhaustive();

  $confirm.require({
    group: 'modal',
    icon: 'pi pi-exclamation-triangle',
    header: `Remove ${entityName}`,
    message: 'Are you sure?',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
    },
    accept: () => {
      projectWriter.removeObject(props.objectId);
    },
  });
}
</script>

<style scoped lang="scss"></style>
