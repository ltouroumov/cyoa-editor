import type { MenuItem } from 'primevue/menuitem';

import {
  type AutoSaveInterval,
  useEditorStore,
} from '~/composables/editor/useEditorStore';
import { useProjectStore } from '~/composables/project/useProjectStore';
import { debounce } from '~/composables/utils/debounce';

export function useEditorAutoSave() {
  const $editor = useEditorStore();
  const $project = useProjectStore();

  const whenInterval = (name: AutoSaveInterval) => {
    if ($editor.autoSaveInterval === name)
      return 'iconify solar--check-circle-line-duotone';
    else return undefined;
  };

  const setInterval = (name: AutoSaveInterval) => () => {
    $editor.autoSaveInterval = name;
  };

  const menuOptions = computed((): MenuItem[] => {
    return [
      {
        label: 'Disabled',
        icon: whenInterval('off'),
        command: setInterval('off'),
      },
      { separator: true },
      {
        label: 'Auto',
        icon: whenInterval('auto'),
        command: setInterval('auto'),
      },
      {
        label: '1 Minute',
        icon: whenInterval(60 * 1000),
        command: setInterval(60 * 1000),
      },
      {
        label: '2 Minutes',
        icon: whenInterval(120 * 1000),
        command: setInterval(120 * 1000),
      },
      {
        label: '5 Minutes',
        icon: whenInterval(300 * 1000),
        command: setInterval(300 * 1000),
      },
      {
        label: '10 Minutes',
        icon: whenInterval(600 * 1000),
        command: setInterval(600 * 1000),
      },
    ];
  });

  $project.$subscribe(
    debounce(() => {
      console.log(`project changed ${Date.now()}`);
    }, 200),
    { flush: 'post' },
  );

  return { autoSaveInterval: $editor.autoSaveInterval, menuOptions };
}
