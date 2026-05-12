# Editor Draft Helpers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Pinia `$subscribe` deep-watching in `useEditorAutoSave` with per-entity draft composables that buffer store writes locally, eliminating keystroke lag in editor text fields.

**Architecture:** Each draft helper (`useDraftObject`, `useDraftScore`, `useDraftStyle`, `useDraftImage`) wraps a shared internal `useDraft` generic that holds a local `ref` clone of one store entity, debounces writes back to the store, and reinits when the store changes externally. A `changeVersion` counter on the project store replaces `$subscribe` as the auto-save signal.

**Tech Stack:** Vue 3 Composition API (`watch`, `toValue`, `MaybeRefOrGetter`, `onUnmounted`, `nextTick`), Pinia, Ramda `clone`

---

## File Map

| File | Action |
|---|---|
| `app/composables/utils/debounce.ts` | Extend: add `cancel` / `flush` to returned function |
| `app/composables/project/useProjectStore.ts` | Extend: add `changeVersion` ref + `markDirty()` |
| `app/composables/editor/useDraft.ts` | Create: internal generic used by all helpers |
| `app/composables/editor/useDraftObject.ts` | Create: thin wrapper for `AnyObject` by ID + type |
| `app/composables/editor/useDraftScore.ts` | Create: thin wrapper for `ProjectScore` by ID |
| `app/composables/editor/useDraftStyle.ts` | Create: thin wrapper for `AnyStyle` by ID |
| `app/composables/editor/useDraftImage.ts` | Create: thin wrapper for `ProjectImage` by ID |
| `app/composables/editor/useEditorAutoSave.ts` | Modify: replace `$subscribe` with watch on `changeVersion` |

---

## Task 1: Extend the `debounce` utility with `cancel` and `flush`

**Files:**
- Modify: `app/composables/utils/debounce.ts`

The current `debounce` returns a plain function. Draft helpers need `cancel()` (drop pending call) and `flush()` (fire immediately with last args). The new return type is additive — existing callers are unaffected.

- [ ] **Step 1: Replace `app/composables/utils/debounce.ts` with the extended version**

```ts
export interface DebouncedFn<Args extends Array<any>> {
  (...args: Args): void
  cancel(): void
  flush(): void
}

export function debounce<Args extends Array<any>>(
  fn: (...args: Args) => void,
  delay: number,
): DebouncedFn<Args> {
  let timeoutId: number | undefined
  let lastArgs: Args | undefined

  const call = (...args: Args): void => {
    lastArgs = args
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      fn(...args)
      lastArgs = undefined
      timeoutId = undefined
    }, delay)
  }

  call.cancel = (): void => {
    window.clearTimeout(timeoutId)
    timeoutId = undefined
    lastArgs = undefined
  }

  call.flush = (): void => {
    if (lastArgs !== undefined) {
      window.clearTimeout(timeoutId)
      const args = lastArgs
      lastArgs = undefined
      timeoutId = undefined
      fn(...args)
    }
  }

  return call
}
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint app/composables/utils/debounce.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/composables/utils/debounce.ts
git commit -m "feat: extend debounce utility with cancel and flush methods"
```

---

## Task 2: Add `changeVersion` and `markDirty` to `useProjectStore`

**Files:**
- Modify: `app/composables/project/useProjectStore.ts`

`changeVersion` is the sole signal auto-save observes. `markDirty()` increments it. Both must be returned from the store so callers can use them.

- [ ] **Step 1: Add `changeVersion` and `markDirty` inside the store definition**

In `app/composables/project/useProjectStore.ts`, add inside the `defineStore` callback (after the existing refs, before the `return`):

```ts
const changeVersion = ref(0)
function markDirty() {
  changeVersion.value++
}
```

- [ ] **Step 2: Export both from the store's return object**

In the `return { ... }` block, add:

```ts
changeVersion,
markDirty,
```

- [ ] **Step 3: Verify lint passes**

```bash
yarn lint app/composables/project/useProjectStore.ts
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/composables/project/useProjectStore.ts
git commit -m "feat: add changeVersion counter and markDirty action to project store"
```

---

## Task 3: Implement the internal `useDraft` generic

**Files:**
- Create: `app/composables/editor/useDraft.ts`

This is the shared implementation used by all four helpers. It is not intended for direct use in components — the typed wrappers in Tasks 4–7 are the public API.

**Behaviour:**
1. Clone the initial store value into a local `ref`.
2. Watch the local `ref` deeply; on change, debounce-flush to the store and call `markDirty()`.
3. Watch the store source shallowly; on external change (i.e. sibling flush or ID change), flush any pending write for the old value, then reinit the draft. Skip if the change is our own echo (`isWriting` guard).
4. On `onUnmounted`, immediately flush any pending write.

- [ ] **Step 1: Create `app/composables/editor/useDraft.ts`**

```ts
import { clone } from 'ramda'
import type { MaybeRefOrGetter } from 'vue'

import { debounce, type DebouncedFn } from '~/composables/utils/debounce'
import { useProjectStore } from '~/composables/project/useProjectStore'

export const DRAFT_FLUSH_DELAY = 300

export function useDraft<T>(
  getFromStore: () => T | undefined,
  setToStore: (value: T) => void,
): Ref<T> {
  const $project = useProjectStore()

  const draft = ref<T>(clone(getFromStore() as T)) as Ref<T>
  let isWriting = false

  const doFlush = (value: T): void => {
    isWriting = true
    setToStore(value)
    $project.markDirty()
    nextTick(() => {
      isWriting = false
    })
  }

  const debouncedFlush: DebouncedFn<[T]> = debounce(doFlush, DRAFT_FLUSH_DELAY)

  watch(
    draft,
    (value) => {
      debouncedFlush(value)
    },
    { deep: true },
  )

  watch(getFromStore, (newVal) => {
    if (isWriting) return
    debouncedFlush.flush()
    if (newVal !== undefined) {
      draft.value = clone(newVal)
    }
  })

  onUnmounted(() => {
    debouncedFlush.flush()
  })

  return draft
}
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint app/composables/editor/useDraft.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/composables/editor/useDraft.ts
git commit -m "feat: add internal useDraft generic for buffered store writes"
```

---

## Task 4: Implement `useDraftObject`

**Files:**
- Create: `app/composables/editor/useDraftObject.ts`

Thin wrapper over `useDraft` for objects stored in `$project.objects` (a `Map<string, AnyObject>`). The `type` parameter is used only to narrow the return type — the store's `get()` helper validates it at runtime.

- [ ] **Step 1: Create `app/composables/editor/useDraftObject.ts`**

```ts
import type { MaybeRefOrGetter } from 'vue'

import { useDraft } from '~/composables/editor/useDraft'
import { useProjectStore } from '~/composables/project/useProjectStore'
import type { ObjectMap } from '~/composables/project/types/v2/objects'
import type { ObjectType } from '~/composables/project/types/v2/objects/base'

export function useDraftObject<T extends ObjectType>(
  source: MaybeRefOrGetter<string>,
  type: T,
): Ref<ObjectMap[T]> {
  const $project = useProjectStore()

  return useDraft<ObjectMap[T]>(
    () => $project.get(toValue(source), type),
    (value) => {
      $project.objects.value.set(toValue(source), value)
    },
  )
}
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint app/composables/editor/useDraftObject.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/composables/editor/useDraftObject.ts
git commit -m "feat: add useDraftObject composable"
```

---

## Task 5: Implement `useDraftScore`

**Files:**
- Create: `app/composables/editor/useDraftScore.ts`

Thin wrapper over `useDraft` for scores stored in `$project.scores` (a `Map<string, ProjectScore>`).

- [ ] **Step 1: Create `app/composables/editor/useDraftScore.ts`**

```ts
import type { MaybeRefOrGetter } from 'vue'

import { useDraft } from '~/composables/editor/useDraft'
import { useProjectStore } from '~/composables/project/useProjectStore'
import type { ProjectScore } from '~/composables/project/types/v2/score'

export function useDraftScore(
  source: MaybeRefOrGetter<string>,
): Ref<ProjectScore> {
  const $project = useProjectStore()

  return useDraft<ProjectScore>(
    () => $project.scores.value.get(toValue(source)),
    (value) => {
      $project.scores.value.set(toValue(source), value)
    },
  )
}
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint app/composables/editor/useDraftScore.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/composables/editor/useDraftScore.ts
git commit -m "feat: add useDraftScore composable"
```

---

## Task 6: Implement `useDraftStyle`

**Files:**
- Create: `app/composables/editor/useDraftStyle.ts`

Thin wrapper over `useDraft` for individual style rules stored in `$project.styles.value.rules` (a `Record<string, AnyStyle>`).

- [ ] **Step 1: Create `app/composables/editor/useDraftStyle.ts`**

```ts
import type { MaybeRefOrGetter } from 'vue'

import { useDraft } from '~/composables/editor/useDraft'
import { useProjectStore } from '~/composables/project/useProjectStore'
import type { AnyStyle } from '~/composables/project/types/v2/styles'

export function useDraftStyle(
  source: MaybeRefOrGetter<string>,
): Ref<AnyStyle> {
  const $project = useProjectStore()

  return useDraft<AnyStyle>(
    () => $project.styles.value.rules[toValue(source)],
    (value) => {
      $project.styles.value.rules[toValue(source)] = value
    },
  )
}
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint app/composables/editor/useDraftStyle.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/composables/editor/useDraftStyle.ts
git commit -m "feat: add useDraftStyle composable"
```

---

## Task 7: Implement `useDraftImage`

**Files:**
- Create: `app/composables/editor/useDraftImage.ts`

Thin wrapper over `useDraft` for images stored in `$project.media.value.images` (a `Record<string, ProjectImage>`).

- [ ] **Step 1: Create `app/composables/editor/useDraftImage.ts`**

```ts
import type { MaybeRefOrGetter } from 'vue'

import { useDraft } from '~/composables/editor/useDraft'
import { useProjectStore } from '~/composables/project/useProjectStore'
import type { ProjectImage } from '~/composables/project/types/v2/media'

export function useDraftImage(
  source: MaybeRefOrGetter<string>,
): Ref<ProjectImage> {
  const $project = useProjectStore()

  return useDraft<ProjectImage>(
    () => $project.media.value.images[toValue(source)],
    (value) => {
      $project.media.value.images[toValue(source)] = value
    },
  )
}
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint app/composables/editor/useDraftImage.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/composables/editor/useDraftImage.ts
git commit -m "feat: add useDraftImage composable"
```

---

## Task 8: Update `useEditorAutoSave` to watch `changeVersion`

**Files:**
- Modify: `app/composables/editor/useEditorAutoSave.ts`

Remove `$subscribe`. Replace with a `watch` on `changeVersion` from the project store. The auto-save delay is 2000ms when `autoSaveInterval` is `'auto'`, or the numeric value otherwise. The actual save logic is a placeholder `console.log` for now.

- [ ] **Step 1: Replace `app/composables/editor/useEditorAutoSave.ts` with the following**

```ts
import type { MenuItem } from 'primevue/menuitem'

import {
  type AutoSaveInterval,
  useEditorStore,
} from '~/composables/editor/useEditorStore'
import { useProjectStore } from '~/composables/project/useProjectStore'
import { debounce } from '~/composables/utils/debounce'

const AUTO_SAVE_DEFAULT_DELAY = 2000

function resolveDelay(interval: AutoSaveInterval): number {
  if (interval === 'auto') return AUTO_SAVE_DEFAULT_DELAY
  if (interval === 'off') return 0
  return interval
}

export function useEditorAutoSave() {
  const $editor = useEditorStore()
  const $project = useProjectStore()

  const whenInterval = (name: AutoSaveInterval) => {
    if ($editor.autoSaveInterval === name)
      return 'iconify solar--check-circle-line-duotone'
    else return undefined
  }

  const setInterval = (name: AutoSaveInterval) => () => {
    $editor.autoSaveInterval = name
  }

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
    ]
  })

  // NOTE: delay is fixed at setup time; reconnecting this to a reactive interval
  // is deferred until the real save logic is implemented.
  const triggerSave = debounce(() => {
    if ($editor.autoSaveInterval === 'off') return
    console.log(`trigger auto-save at ${Date.now()}`)
  }, resolveDelay($editor.autoSaveInterval))

  watch(() => $project.changeVersion, triggerSave)

  return { autoSaveInterval: $editor.autoSaveInterval, menuOptions }
}
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint app/composables/editor/useEditorAutoSave.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/composables/editor/useEditorAutoSave.ts
git commit -m "feat: replace \$subscribe with changeVersion watch in useEditorAutoSave"
```
