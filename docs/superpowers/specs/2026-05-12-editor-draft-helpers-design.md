# Editor Draft Helpers — Design Spec

**Date:** 2026-05-12
**Branch:** editor

## Problem

`useEditorAutoSave` subscribes to the project store via Pinia's `$subscribe`, which deep-watches the entire store state on every mutation. The project store holds large `Map` structures (`objects`, `children`, `scores`, etc.), so this deep traversal runs on every keystroke, causing ~1s of input lag in text fields.

## Goal

Eliminate the deep-watch overhead from auto-save without changing the v-model ergonomics in editor components.

## Solution Overview

Two complementary changes:

1. **Draft helpers** — composables that buffer store writes locally per component, flushing to the store on a debounce. Each helper watches only one small entity deeply (one `Choice`, one `StyleRule`, etc.) rather than the entire project.
2. **Dirty signal in the project store** — a `changeVersion` counter incremented by each draft flush. Auto-save watches this single number instead of deep-watching store state.

---

## Draft Helpers

### API

```ts
// Objects (by ID + type — most common case)
const choice = useDraftObject(() => objectId, ObjectType.choice)  // Ref<Choice>
const row    = useDraftObject(() => objectId, ObjectType.row)     // Ref<Row>

// Scores
const score  = useDraftScore(() => scoreId)                       // Ref<ProjectScore>

// Style rules (individual rules by ID)
const style  = useDraftStyle(() => styleId)                       // Ref<StyleRule>
// Default style rules are small enough to bind directly to the store.

// Images
const image  = useDraftImage(() => imageId)                       // Ref<ProjectImage>
```

Each helper returns a deeply reactive `Ref` of the whole entity. Components use `v-model="choice.name"` exactly as before — the helper owns the flush plumbing internally.

### ID parameter

All helpers accept `MaybeRefOrGetter<string>` for the ID parameter (i.e. a plain `string`, a `Ref<string>`, or a getter `() => string`), normalized internally via Vue's `toValue()`. When the resolved ID changes, the helper flushes any pending draft for the old entity and reinitializes from the store for the new one — the same reinit path used for external store changes.

### Shared flush delay

All helpers use a single exported constant:

```ts
export const DRAFT_FLUSH_DELAY = 300 // ms
```

### Internal behaviour (same for all helpers)

1. Read the initial value from the store and `clone()` it into a local `ref`.
2. Watch the local ref deeply. Because each helper watches only one entity (not the full Map), the cost is bounded by the size of a single object — typically small.
3. On local change, debounce the write-back by `DRAFT_FLUSH_DELAY`. On flush: write the draft value into the store, then call `$project.markDirty()`.
4. On `onUnmounted`, cancel the pending debounce and flush immediately so edits are never lost on navigation.
5. Watch the store source for external changes. If the store value changes and the helper is not currently writing (see guard below), reinitialize the draft from the store. This handles the case where a parent or sibling component updates the same entity.

### External sync guard

When the helper flushes its draft to the store, that store write would trigger the store watcher and cause a spurious reinit loop. An `isWriting` flag prevents this:

```
draft changes
  → debounce fires
  → isWriting = true
  → write to store + markDirty()
  → nextTick: isWriting = false

store watcher fires
  → if isWriting: skip (own echo)
  → else: reinit draft from store (external change)
```

**Known limitation:** If two components hold drafts of the *exact same entity* and both have unsaved local edits simultaneously, a flush from one will cause the other to reinit from the store, discarding any un-flushed edits in the second component. In practice this is very unlikely given the 300ms flush window and the fact that a user can only type in one field at a time.

---

## Project Store Changes

Add to `useProjectStore`:

```ts
const changeVersion = ref(0)
function markDirty() { changeVersion.value++ }
```

Both are exported. `changeVersion` is the sole signal auto-save observes. `markDirty()` is called by draft helpers after each flush.

---

## Auto-Save Changes

Remove `$subscribe` from `useEditorAutoSave`. Replace with:

```ts
const { changeVersion } = useProjectStoreRefs()
watch(changeVersion, debounce(() => {
  console.log(`trigger auto-save at ${Date.now()}`)
}, autoSaveDelay))
```

`autoSaveDelay` is derived from `$editor.autoSaveInterval` (e.g. 2000ms for `'auto'`, or the configured millisecond value). This is separate from and longer than `DRAFT_FLUSH_DELAY`.

Watching `changeVersion` (a single number) has negligible overhead regardless of project size.

The actual save implementation is out of scope for this chunk of work.

---

## `debounce` Utility Extension

The current `debounce` returns only a call wrapper. The draft helpers need `cancel()` and `flush()` for the unmount flush. New signature:

```ts
interface DebouncedFn<Args extends Array<any>> {
  (...args: Args): void
  cancel(): void
  flush(): void  // cancels timeout, calls fn immediately with last args
}

function debounce<Args extends Array<any>>(
  fn: (...args: Args) => void,
  delay: number,
): DebouncedFn<Args>
```

Existing call sites (which use the return value as a plain function) are unaffected — the extra methods are additive.

---

## Files Changed

| File | Change |
|---|---|
| `app/composables/utils/debounce.ts` | Add `cancel` / `flush` to returned object |
| `app/composables/project/useProjectStore.ts` | Add `changeVersion` ref + `markDirty()` action |
| `app/composables/editor/useDraftObject.ts` | New |
| `app/composables/editor/useDraftScore.ts` | New |
| `app/composables/editor/useDraftStyle.ts` | New |
| `app/composables/editor/useDraftImage.ts` | New |
| `app/composables/editor/useEditorAutoSave.ts` | Replace `$subscribe` with watch on `changeVersion` |

---

## Out of Scope

- Migrating existing editor components to use the draft helpers (separate task).
- Undo/redo support (no such feature exists yet; draft helpers are compatible with a future undo stack since the store remains the source of truth).
- Config and default style rules — these are small and expected to be infrequently edited; direct store binding is acceptable.
