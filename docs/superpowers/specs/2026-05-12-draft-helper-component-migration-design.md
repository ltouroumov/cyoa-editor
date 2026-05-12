# Draft Helper Component Migration — Design Spec

**Date:** 2026-05-12
**Branch:** editor

## Problem

Editor components currently bind `v-model` directly to store entities fetched via
`computed(() => store.get(id, type))`. Every keystroke in a text field writes through to
the Pinia store synchronously, which was the original source of the per-keystroke lag addressed
by the draft helpers (see `docs/superpowers/specs/2026-05-12-editor-draft-helpers-design.md`).

The draft helpers exist but no editor component uses them yet. This migration wires them in.

## Goal

Replace `computed(() => store.get(...))` with `useDraftX` in each top-level editor screen, and
update child form components to receive the draft entity via `defineModel<EntityType>()` rather
than re-fetching it from the store by ID.

## Scope

- **In scope:** `app/components/editor/` components that mutate store entities
- **Out of scope:** display-only components, `ChoiceLayout.vue`, `RowScreen.vue`,
  `EditScoreModal.vue` (already uses `useModalClient` local draft), `EditSimpleHeaderStyle.vue`
  (not yet implemented)

---

## Architecture

**One draft per top-level screen.** The screen creates the draft and holds the `Ref<Entity>`.
Child form components receive it via `defineModel<EntityType>({ required: true })` and mutate
it in-place. No `Ref<X>` passes through component props.

**Why in-place mutation works:** `defineModel` passes the same object reference down the
component tree. Children mutating `model.value.someProperty = x` modify the same cloned
object the draft holds, so all mutations accumulate in the draft and are flushed together.

**Flush path:** user types → draft ref mutated → 300ms debounce → `setToStore(draft.value)` →
`markDirty()` → `changeVersion++` → auto-save watcher fires.

---

## Top-Level Screens

These four components replace their `computed(() => store.get(...))` with a draft helper and
pass the entity to children via `v-model` instead of an `id` prop.

| Component | Current | After |
|---|---|---|
| `ChoiceScreen.vue` | `computed(() => store.get(choiceId, ObjectType.choice))` | `useDraftObject(() => props.choiceId, ObjectType.choice)` |
| `RowScreenHeader.vue` | `computed(() => store.get(rowId, ObjectType.row))` | `useDraftObject(() => props.rowId, ObjectType.row)` |
| `PageScreen.vue` | `computed(() => store.get(pageId, ObjectType.page))` | `useDraftObject(() => props.pageId, ObjectType.page)` |
| `EditStyleScreen.vue` | `computed(() => store.styles.rules[styleId])` | `useDraftStyle(() => props.styleId)` |

Each screen changes its child references from `:choice-id="choiceId"` → `v-model="choice"` (and
similarly for row/style). The `useProjectStore` import can be removed from screens that no longer
use it for anything else.

---

## Child Components

Each child drops its `id` prop and replaces `computed(() => store.get(...))` with
`defineModel<EntityType>({ required: true })`. All internal `v-model="entity.prop"` bindings
stay unchanged.

### Choice chain

`ChoiceScreen` passes `v-model="choice"` to:

| Component | Drops | Gains |
|---|---|---|
| `ChoiceHeaderForm.vue` | `choiceId` prop | `defineModel<ChoiceObject>({ required: true })` |
| `ChoiceComponentsForm.vue` | `choiceId` prop | `defineModel<ChoiceObject>({ required: true })` |
| `ChoiceStyleForm.vue` | `choiceId` prop | `defineModel<ChoiceObject>({ required: true })` |

`ChoiceComponentsForm` is itself a chain link: it receives the choice and forwards it to its
dynamically-dispatched children (see special case below).

| Component | Drops | Gains |
|---|---|---|
| `ChoiceRequirementsForm.vue` | `choiceId` prop | `defineModel<ChoiceObject>({ required: true })` |
| `ChoiceScoreForm.vue` | `choiceId` prop | `defineModel<ChoiceObject>({ required: true })` |

### Row chain

`RowScreenHeader` passes `v-model="row"` to:

| Component | Drops | Gains |
|---|---|---|
| `RowHeaderForm.vue` | `rowId` prop | `defineModel<RowObject>({ required: true })` |
| `RowLayoutForm.vue` | `rowId` prop | `defineModel<RowObject>({ required: true })` |
| `RowRequirementsForm.vue` | `rowId` prop | `defineModel<RowObject>({ required: true })` |
| `RowStyleForm.vue` | `rowId` prop | `defineModel<RowObject>({ required: true })` |

### Style chain

`EditStyleScreen` passes `v-model="style"` to:

| Component | Drops | Gains |
|---|---|---|
| `EditSimpleStyle.vue` | `styleId` prop | `defineModel<AnySimpleStyle>({ required: true })` |
| `EditSimpleContentStyle.vue` | `styleId` prop | `defineModel<AnySimpleStyle>({ required: true })` |

`EditSimpleStyle` also drops its own `useProjectStore` call and passes `v-model="style"` to
its children (`EditSimpleContentStyle`).

---

## Special Case: ChoiceComponentsForm Dynamic Dispatch

`ChoiceComponentsForm` renders children via `<component :is="..." v-bind="component.props" />`.
Currently `component.props` is `{ choiceId: props.choiceId }`. After migration it must forward
the choice model to children that now expect `modelValue`.

**Change:** replace the `props` field in each `dispatchComponent` return:

```ts
// Before
props: { choiceId: props.choiceId }

// After
props: {
  modelValue: choice.value,
  'onUpdate:modelValue': (v: ChoiceObject) => { choice.value = v },
}
```

Where `choice` is the `defineModel<ChoiceObject>()` ref in `ChoiceComponentsForm`.

**Why this is correct:** `choice.value` passes the same object reference as `modelValue` to
the child. In-place mutations the child makes (e.g. `model.value.components.scores.items = ...`)
modify the same object, which is the draft held by `ChoiceScreen`. These mutations accumulate
and flush together. If a child replaces the whole object (`model.value = { ...model.value, x }`)
it emits `update:modelValue`, which calls the handler and updates `choice.value` in
`ChoiceComponentsForm`, which in turn emits its own `update:modelValue`, updating the draft in
`ChoiceScreen`.

**Note:** `ChoiceScoreForm` and `ChoiceRequirementsForm` still read from `projectStore` for
reference data (list of available scores, list of choices for condition pickers). These read-only
lookups are unaffected by this migration.

---

## Files Changed

| File | Change |
|---|---|
| `app/components/editor/screens/content/ChoiceScreen.vue` | `useDraftObject`, pass `v-model="choice"` to children |
| `app/components/editor/screens/content/RowScreenHeader.vue` | `useDraftObject`, pass `v-model="row"` to children |
| `app/components/editor/screens/content/PageScreen.vue` | `useDraftObject`, uses `v-model="page.name"` directly |
| `app/components/editor/screens/styles/EditStyleScreen.vue` | `useDraftStyle`, pass `v-model="style"` to children |
| `app/components/editor/screens/content/choice/ChoiceHeaderForm.vue` | drop `choiceId` prop → `defineModel<ChoiceObject>()` |
| `app/components/editor/screens/content/choice/ChoiceComponentsForm.vue` | drop `choiceId` prop → `defineModel<ChoiceObject>()`, update dynamic dispatch |
| `app/components/editor/screens/content/choice/ChoiceStyleForm.vue` | drop `choiceId` prop → `defineModel<ChoiceObject>()` |
| `app/components/editor/screens/content/choice/components/ChoiceRequirementsForm.vue` | drop `choiceId` prop → `defineModel<ChoiceObject>()` |
| `app/components/editor/screens/content/choice/components/ChoiceScoreForm.vue` | drop `choiceId` prop → `defineModel<ChoiceObject>()` |
| `app/components/editor/screens/content/row/RowHeaderForm.vue` | drop `rowId` prop → `defineModel<RowObject>()` |
| `app/components/editor/screens/content/row/RowLayoutForm.vue` | drop `rowId` prop → `defineModel<RowObject>()` |
| `app/components/editor/screens/content/row/RowRequirementsForm.vue` | drop `rowId` prop → `defineModel<RowObject>()` |
| `app/components/editor/screens/content/row/RowStyleForm.vue` | drop `rowId` prop → `defineModel<RowObject>()` |
| `app/components/editor/screens/styles/simple/EditSimpleStyle.vue` | drop `styleId` prop → `defineModel<AnySimpleStyle>()`, pass `v-model="style"` to children |
| `app/components/editor/screens/styles/simple/EditSimpleContentStyle.vue` | drop `styleId` prop → `defineModel<AnySimpleStyle>()` |
