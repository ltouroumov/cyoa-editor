import { defineStore } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { isNotNil } from 'ramda';

import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';
import {
  type AutoSaveInterval,
  useEditorStore,
} from '~/composables/editor/useEditorStore';
import { useProjectStore } from '~/composables/project/useProjectStore';
import { debounce } from '~/composables/utils/debounce';

const AUTO_SAVE_DEFAULT_DELAY = 2000;

function resolveDelay(interval: AutoSaveInterval): number {
  if (interval === 'auto') return AUTO_SAVE_DEFAULT_DELAY;
  if (interval === 'off') return 0;
  return interval;
}

export const useEditorAutoSave = defineStore('editor/auto-save', () => {
  const $editor = useEditorStore();
  const $project = useProjectStore();
  const $library = useEditorLibrary();

  const whenInterval = (name: AutoSaveInterval) => {
    if ($editor.autoSaveInterval === name)
      return 'iconify solar--check-circle-line-duotone';
    else return undefined;
  };

  const writeSaveInterval = (name: AutoSaveInterval) => () => {
    $editor.autoSaveInterval = name;
  };

  const menuOptions = computed((): MenuItem[] => {
    return [
      {
        label: 'Disabled',
        icon: whenInterval('off'),
        command: writeSaveInterval('off'),
      },
      { separator: true },
      {
        label: 'Auto',
        icon: whenInterval('auto'),
        command: writeSaveInterval('auto'),
      },
      {
        label: '30 Seconds',
        icon: whenInterval(30 * 1000),
        command: writeSaveInterval(30 * 1000),
      },
      {
        label: '1 Minute',
        icon: whenInterval(60 * 1000),
        command: writeSaveInterval(60 * 1000),
      },
      {
        label: '2 Minutes',
        icon: whenInterval(120 * 1000),
        command: writeSaveInterval(120 * 1000),
      },
      {
        label: '5 Minutes',
        icon: whenInterval(300 * 1000),
        command: writeSaveInterval(300 * 1000),
      },
      {
        label: '10 Minutes',
        icon: whenInterval(600 * 1000),
        command: writeSaveInterval(600 * 1000),
      },
    ];
  });

  let lastDynamicSaveTime = Date.now();
  let dynamicSaveTimer: any = undefined;
  const triggerSave = debounce(() => {
    if ($editor.autoSaveInterval !== 'auto') return;

    const curTime = Date.now();
    if (curTime - lastDynamicSaveTime < AUTO_SAVE_DEFAULT_DELAY) {
      // if the last auto-save was less than the default delay ago, schedule one in the future
      // this ensures that we save at least once every 2 seconds
      dynamicSaveTimer = setTimeout(
        () => triggerSave(),
        AUTO_SAVE_DEFAULT_DELAY,
      );
    } else {
      // if the last auto-save was more than the default delay ago, save immediately

      // clear the pending auto-save timer, in case there is a pending operation
      clearTimeout(dynamicSaveTimer);
      dynamicSaveTimer = undefined;

      // save the project
      $library.saveProject().then(() => {
        console.log(`project saved at ${Date.now()}`);
        // update the last auto-save time
        lastDynamicSaveTime = curTime;
      });
    }
  }, 200);

  let scheduledSaveTimer: any = undefined;
  let lastScheduledSaveVersion = $project.changeVersion;
  watch(
    () => $editor.autoSaveInterval,
    () => {
      if (isNotNil(scheduledSaveTimer)) {
        clearInterval(scheduledSaveTimer);
        scheduledSaveTimer = undefined;
      }

      if (
        $editor.autoSaveInterval !== 'auto' &&
        $editor.autoSaveInterval !== 'off'
      ) {
        const delay = resolveDelay($editor.autoSaveInterval);
        scheduledSaveTimer = setInterval(() => {
          // save the project
          if ($project.changeVersion > lastScheduledSaveVersion) {
            $library.saveProject().then(() => {
              console.log(
                `project saved at ${Date.now()} (${$project.changeVersion})`,
              );
              lastScheduledSaveVersion = $project.changeVersion;
            });
          } else {
            console.log(`save skipped: no changes (${$project.changeVersion})`);
          }
        }, delay);
        console.log(`auto-save interval set to ${delay}ms`);
      }
    },
    { immediate: true },
  );

  watch(
    () => $project.changeVersion,
    () => triggerSave(),
  );

  return { autoSaveInterval: $editor.autoSaveInterval, menuOptions };
});
