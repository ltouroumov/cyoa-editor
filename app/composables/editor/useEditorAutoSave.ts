import { defineStore } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { isNil, isNotNil } from 'ramda';

import { useEditorLibrary } from '~/composables/editor/useEditorLibrary';
import {
  type AutoSaveInterval,
  useEditorStore,
} from '~/composables/editor/useEditorStore';
import { useProjectStore } from '~/composables/project/useProjectStore';
import { debounce } from '~/composables/utils/debounce';

// auto-save every 5 seconds
const AUTO_SAVE_DEFAULT_DELAY = 1000 * 5;

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

  const lastSaveVersion = ref<number>($project.changeVersion);
  const lastSaveTime = ref<number>(Date.now());

  const isDirty = computed(
    () => $project.changeVersion > lastSaveVersion.value,
  );

  const saveMutex = ref<boolean>(false);
  const doSave = () => {
    if (saveMutex.value) return;
    saveMutex.value = true;
    $library.saveProject().then(() => {
      console.log(`project saved at ${Date.now()} (${$project.changeVersion})`);
      // update the last auto-save time
      lastSaveVersion.value = $project.changeVersion;
      lastSaveTime.value = Date.now();
      saveMutex.value = false;
    });
  };

  const dynamicSaveTimer = ref<any>(undefined);
  const triggerSave = debounce(() => {
    if ($editor.autoSaveInterval !== 'auto') return;

    if ($project.changeVersion > lastSaveVersion.value) {
      const now = Date.now();
      const elapsed = now - lastSaveTime.value;
      if (elapsed < AUTO_SAVE_DEFAULT_DELAY) {
        if (isNil(dynamicSaveTimer.value)) {
          // only start a timer if there's no pending save
          const saveDelay = AUTO_SAVE_DEFAULT_DELAY - elapsed;
          dynamicSaveTimer.value = setTimeout(() => doSave(), saveDelay);
          console.log(`auto-save delayed by ${saveDelay}ms`);
        } else {
          console.log('auto-save already pending, skipping');
        }
      } else {
        // kill any pending save operation
        clearTimeout(dynamicSaveTimer.value);
        dynamicSaveTimer.value = undefined;

        // if the project has changed since the last save, trigger a save
        doSave();
      }
    }
  }, 200);

  const scheduledSaveTimer = ref<any>(undefined);
  watch(
    () => $editor.autoSaveInterval,
    () => {
      if (isNotNil(scheduledSaveTimer.value)) {
        clearInterval(scheduledSaveTimer.value);
        scheduledSaveTimer.value = undefined;
      }

      if (
        $editor.autoSaveInterval !== 'auto' &&
        $editor.autoSaveInterval !== 'off'
      ) {
        const delay = resolveDelay($editor.autoSaveInterval);
        scheduledSaveTimer.value = setInterval(() => {
          // save the project
          if ($project.changeVersion > lastSaveVersion.value) {
            doSave();
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

  return {
    autoSaveInterval: $editor.autoSaveInterval,
    menuOptions,
    lastSaveTime,
    lastSaveVersion,
    isDirty,
    // private store values
    // note: pinia requires all store refs to be returned to work properly
    __dynamicSaveTimer: dynamicSaveTimer,
    __scheduledSaveTimer: scheduledSaveTimer,
    __saveMutex: saveMutex,
  };
});
