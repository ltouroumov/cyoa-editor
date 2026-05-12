# Draft Helper Component Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `computed(() => store.get(...))` with `useDraftX` helpers in each top-level editor screen, and update child form components to receive the draft entity via `defineModel<EntityType>({ required: true })` instead of re-fetching by ID.

**Architecture:** One draft per top-level screen (`useDraftObject` / `useDraftStyle`). Child components drop their `id` prop and use `defineModel` instead; the parent passes the entity with `v-model`. In-place mutations on the draft object propagate naturally through the shared object reference. The `ChoiceComponentsForm` dynamic dispatch adds `v-model="choice"` directly on the `<component>` tag.

**Tech Stack:** Vue 3 `defineModel`, Nuxt 3 auto-imports (`computed`, `ref`, `defineAsyncComponent`), `useDraftObject` / `useDraftStyle` from `~/composables/editor/`, TypeScript

---

## Context

This is a purely mechanical refactor — no new functionality. There are no unit tests for these Vue components, so verification is via `yarn lint`. Each chain (choice / row / style / page) is one task that must be committed atomically: the parent update breaks TypeScript until all children are also updated, so the full chain is implemented before linting and committing.

**Auto-imports:** In this Nuxt project, `computed`, `ref`, `watch`, `nextTick`, `onUnmounted`, `toValue`, and `defineModel` are Nuxt auto-imports — do NOT add explicit imports for them.

**Import ordering enforced by ESLint:** external packages → `~/components/` → `~/composables/` (alphabetically within each group). The linter will fail if this order is violated.

**Lint command:** `yarn lint <file-path>` — run per-file after implementation.

---

## File Map

| File | Action |
|---|---|
| `app/components/editor/screens/content/choice/ChoiceHeaderForm.vue` | Modify: drop `choiceId` prop → `defineModel<ChoiceObject>()` |
| `app/components/editor/screens/content/choice/ChoiceStyleForm.vue` | Modify: drop `choiceId` prop → `defineModel<ChoiceObject>()` |
| `app/components/editor/screens/content/choice/components/ChoiceRequirementsForm.vue` | Modify: drop `choiceId` prop → `defineModel<ChoiceObject>()` |
| `app/components/editor/screens/content/choice/components/ChoiceScoreForm.vue` | Modify: drop `choiceId` prop → `defineModel<ChoiceObject>()` |
| `app/components/editor/screens/content/choice/ChoiceComponentsForm.vue` | Modify: drop `choiceId` prop → `defineModel<ChoiceObject>()`, add `v-model` on dynamic component tag |
| `app/components/editor/screens/content/ChoiceScreen.vue` | Modify: `useDraftObject`, pass `v-model="choice"` to children |
| `app/components/editor/screens/content/row/RowHeaderForm.vue` | Modify: drop `rowId` prop → `defineModel<RowObject>()` |
| `app/components/editor/screens/content/row/RowLayoutForm.vue` | Modify: drop `rowId` prop → `defineModel<RowObject>()` |
| `app/components/editor/screens/content/row/RowRequirementsForm.vue` | Modify: drop `rowId` prop → `defineModel<RowObject>()` |
| `app/components/editor/screens/content/row/RowStyleForm.vue` | Modify: drop `rowId` prop → `defineModel<RowObject>()` |
| `app/components/editor/screens/content/RowScreenHeader.vue` | Modify: `useDraftObject`, pass `v-model="row"` to children |
| `app/components/editor/screens/styles/simple/EditSimpleContentStyle.vue` | Modify: drop `styleId` prop → `defineModel<AnyStyle>()` |
| `app/components/editor/screens/styles/simple/EditSimpleStyle.vue` | Modify: drop `styleId` prop → `defineModel<AnyStyle>()`, pass `v-model` to children |
| `app/components/editor/screens/styles/EditStyleScreen.vue` | Modify: `useDraftStyle`, template already passes `v-model="style"` to children |
| `app/components/editor/screens/content/PageScreen.vue` | Modify: `useDraftObject` |

---

## Task 1: Migrate the choice chain

**Files:**
- Modify: `app/components/editor/screens/content/choice/ChoiceHeaderForm.vue`
- Modify: `app/components/editor/screens/content/choice/ChoiceStyleForm.vue`
- Modify: `app/components/editor/screens/content/choice/components/ChoiceRequirementsForm.vue`
- Modify: `app/components/editor/screens/content/choice/components/ChoiceScoreForm.vue`
- Modify: `app/components/editor/screens/content/choice/ChoiceComponentsForm.vue`
- Modify: `app/components/editor/screens/content/ChoiceScreen.vue`

- [ ] **Step 1: Update `ChoiceHeaderForm.vue` — replace `choiceId` prop with `defineModel`**

Replace the entire `<script setup>` block (template is unchanged):

```vue
<script setup lang="ts">
import { isNil } from 'ramda';

import ChoiceImage from '~/components/editor/screens/content/choice/ChoiceImage.vue';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';

const choice = defineModel<ChoiceObject>({ required: true });
</script>
```

- [ ] **Step 2: Update `ChoiceStyleForm.vue` — replace `choiceId` prop with `defineModel`**

Replace the `<script setup>` block (template is unchanged):

```vue
<script setup lang="ts">
import { append, equals, indexOf, reject, swap, uniq } from 'ramda';

import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { StyleTarget } from '~/composables/project/types/v2/styles';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const choice = defineModel<ChoiceObject>({ required: true });

const rowStyles = computed(() => {
  return (choice.value.styles ?? []).map((styleId) => {
    return projectStore.styles.rules[styleId];
  });
});
const addStyleId = ref();

const StylesList = computed(() => {
  return Object.values(projectStore.styles.rules).filter(
    (style) => style.target === StyleTarget.choice,
  );
});

const doAddStyle = () => {
  if (!addStyleId.value) return;
  choice.value.styles = uniq(
    append(addStyleId.value, choice.value.styles ?? []),
  );
  addStyleId.value = undefined;
};

const doRemoveStyle = (styleId: string) => {
  choice.value.styles = reject(equals(styleId), choice.value.styles ?? []);
};

const doMoveUp = (styleId: string) => {
  const idx = indexOf(styleId, choice.value.styles ?? []);
  if (idx === -1 || idx === 0) return;
  choice.value.styles = swap(idx, idx - 1, choice.value.styles ?? []);
};
const doMoveDown = (styleId: string) => {
  const idx = indexOf(styleId, choice.value.styles ?? []);
  if (idx === -1 || idx === (choice.value.styles ?? []).length - 1) return;
  choice.value.styles = swap(idx, idx + 1, choice.value.styles ?? []);
};
</script>
```

`useProjectStore` is kept because it still reads `projectStore.styles.rules` for display.

- [ ] **Step 3: Update `ChoiceRequirementsForm.vue` — replace `choiceId` prop with `defineModel`**

Replace the `<script setup>` block (template is unchanged):

```vue
<script setup lang="ts">
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import {
  append,
  assoc,
  clone,
  find,
  findIndex,
  isNil,
  isNotNil,
  reject,
  swap,
  update,
} from 'ramda';

import IconButton from '~/components/utils/IconButton.vue';
import { ConditionTypes } from '~/composables/editor/const';
import { createId } from '~/composables/project/types/v2/id';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import {
  ComponentType,
  type RequirementsComponent,
} from '~/composables/project/types/v2/objects/components/choice';
import {
  ConditionMode,
  ConditionType,
  type ObjectCondition,
} from '~/composables/project/types/v2/objects/components/condition';
import { useProjectStore } from '~/composables/project/useProjectStore';

const LazyEditRequirementModal = defineAsyncComponent(
  () => import('~/components/editor/modals/EditRequirementModal.vue'),
);

const $confirm = useConfirm();
const $dialog = useDialog();
const projectStore = useProjectStore();

const choice = defineModel<ChoiceObject>({ required: true });
const component = computed((): RequirementsComponent => {
  return choice.value.components[ComponentType.Requirements]!;
});

function getConditionTypeLabel(type: ConditionType): string {
  return find((ct) => ct.value === type, ConditionTypes)?.label ?? 'Unknown';
}

function getChoiceName(choiceId: string) {
  return projectStore.get(choiceId, ObjectType.choice)?.name ?? 'Unknown';
}

const editRequirement = (id: string) => {
  const condIdx = findIndex(
    (cond) => cond.id === id,
    component.value.requirements,
  );
  if (condIdx === -1) return;

  $dialog.open(LazyEditRequirementModal, {
    data: {
      condition: clone(component.value.requirements[condIdx]),
    },
    onClose: (
      options: DynamicDialogCloseOptions<{ update: ObjectCondition }>,
    ) => {
      if (isNil(options.data)) return;

      component.value.requirements = update(
        condIdx,
        options.data.update,
        component.value.requirements,
      );
    },
    props: {
      header: `Edit Requirement for ${choice.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};

const DefaultCondition: Omit<ObjectCondition, 'id'> = {
  type: ConditionType.required,
  mode: ConditionMode.all,
  objectIds: [],
  hidden: true,
};

const addRequirement = () => {
  $dialog.open(LazyEditRequirementModal, {
    data: {
      condition: clone(assoc('id', createId(), DefaultCondition)),
    },
    onClose: (
      options: DynamicDialogCloseOptions<{ update: ObjectCondition }>,
    ) => {
      if (isNil(options.data)) return;

      component.value.requirements = append(
        options.data.update,
        component.value.requirements,
      );
    },
    props: {
      header: `Edit Requirement for ${choice.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};

const removeRequirement = (id: string, $event: any) => {
  $confirm.require({
    group: 'popup',
    target: $event.currentTarget,
    icon: 'pi pi-exclamation-triangle',
    header: 'Remove Requirement',
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
      component.value.requirements = reject(
        (cond) => cond.id === id,
        component.value.requirements,
      );
    },
  });
};

const moveRequirement = (id: string, direction: 'up' | 'down') => {
  const scoreIdx = findIndex(
    (cond) => cond.id === id,
    component.value.requirements,
  );

  if (scoreIdx === -1) return;

  const destIdx = direction === 'up' ? scoreIdx - 1 : scoreIdx + 1;

  if (destIdx < 0 || destIdx >= component.value.requirements.length) return;

  component.value.requirements = swap(
    scoreIdx,
    destIdx,
    component.value.requirements,
  );
};
</script>
```

`ObjectType` is kept because `getChoiceName` still calls `projectStore.get(choiceId, ObjectType.choice)` to look up sibling choices by ID.

- [ ] **Step 4: Update `ChoiceScoreForm.vue` — replace `choiceId` prop with `defineModel`**

Replace the `<script setup>` block (template is unchanged):

```vue
<script setup lang="ts">
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import {
  append,
  assoc,
  clone,
  find,
  findIndex,
  isNil,
  isNotNil,
  reject,
  swap,
  update,
} from 'ramda';

import IconButton from '~/components/utils/IconButton.vue';
import { ScoreTypes } from '~/composables/editor/const';
import { createId } from '~/composables/project/types/v2/id';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import {
  ComponentType,
  type ScoresComponent,
} from '~/composables/project/types/v2/objects/components/choice';
import {
  type ObjectScore,
  ScoreType,
} from '~/composables/project/types/v2/score';
import { useProjectStore } from '~/composables/project/useProjectStore';

const LazyEditScoreModal = defineAsyncComponent(
  () => import('~/components/editor/modals/EditScoreModal.vue'),
);

const $confirm = useConfirm();
const $dialog = useDialog();
const projectStore = useProjectStore();

const choice = defineModel<ChoiceObject>({ required: true });
const component = computed((): ScoresComponent => {
  return choice.value.components[ComponentType.Scores]!;
});

function getScoreTypeLabel(type: ScoreType): string {
  return find((ct) => ct.value === type, ScoreTypes)?.label ?? 'Unknown';
}

function getScoreName(scoreId: string) {
  return projectStore.scores.get(scoreId)?.title ?? 'Unknown';
}

const editScore = (id: string) => {
  const condIdx = findIndex((cond) => cond.id === id, component.value.scores);
  if (condIdx === -1) return;

  $dialog.open(LazyEditScoreModal, {
    data: {
      score: clone(component.value.scores[condIdx]),
    },
    onClose: (options: DynamicDialogCloseOptions<{ update: ObjectScore }>) => {
      if (isNil(options.data)) return;

      component.value.scores = update(
        condIdx,
        options.data.update,
        component.value.scores,
      );
    },
    props: {
      header: `Edit Requirement for ${choice.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};

const DefaultScore: Partial<ObjectScore> = {
  type: ScoreType.Cost,
};

const addScore = () => {
  $dialog.open(LazyEditScoreModal, {
    data: {
      score: clone(assoc('id', createId(), DefaultScore)),
    },
    onClose: (options: DynamicDialogCloseOptions<{ update: ObjectScore }>) => {
      if (isNil(options.data)) return;

      component.value.scores = append(
        options.data.update,
        component.value.scores,
      );
    },
    props: {
      header: `Edit Requirement for ${choice.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};

const removeScore = (id: string, $event: any) => {
  $confirm.require({
    group: 'popup',
    target: $event.currentTarget,
    icon: 'pi pi-exclamation-triangle',
    header: 'Remove Requirement',
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
      component.value.scores = reject(
        (cond) => cond.id === id,
        component.value.scores,
      );
    },
  });
};

const moveScore = (id: string, direction: 'up' | 'down') => {
  const scoreIdx = findIndex(
    (score) => score.id === id,
    component.value.scores,
  );

  if (scoreIdx === -1) return;

  const destIdx = direction === 'up' ? scoreIdx - 1 : scoreIdx + 1;

  if (destIdx < 0 || destIdx >= component.value.scores.length) return;

  component.value.scores = swap(scoreIdx, destIdx, component.value.scores);
};
</script>
```

`ObjectType` is removed (was only used in the old `computed(() => projectStore.get(props.choiceId, ObjectType.choice))`).

- [ ] **Step 5: Update `ChoiceComponentsForm.vue` — replace `choiceId` prop with `defineModel`, add `v-model` on dynamic component tag**

Replace the entire file:

```vue
<template>
  <div class="grid grid-cols-2 gap-2 auto-rows-auto">
    <template v-for="component in components" :key="component.key">
      <component :is="component.component" v-bind="component.props ?? {}" v-model="choice" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { filter, isNotNil, map, values } from 'ramda';

import ChoiceScoreForm from '~/components/editor/screens/content/choice/components/ChoiceScoreForm.vue';
import type { ChoiceObject } from '~/composables/project/types/v2/objects';
import {
  type BaseComponent,
  ComponentType,
} from '~/composables/project/types/v2/objects/components/choice';

const choice = defineModel<ChoiceObject>({ required: true });

const components = computed((): ChoiceComponent[] => {
  return filter(
    (c): c is ChoiceComponent => isNotNil(c),
    map(
      (c) => dispatchComponent(c as BaseComponent<ComponentType>),
      values(choice.value.components),
    ),
  );
});

type ChoiceComponent = { key: ComponentType; component: any; props?: any };
function dispatchComponent(
  component: BaseComponent<ComponentType>,
): ChoiceComponent | undefined {
  console.log('dispatchComponent', component);

  switch (component.type) {
    case ComponentType.Requirements:
      return {
        key: component.type,
        component: ChoiceRequirementsForm,
      };
    case ComponentType.Scores:
      return {
        key: component.type,
        component: ChoiceScoreForm,
      };
    default:
      return undefined;
  }
}

const ChoiceRequirementsForm = defineAsyncComponent(
  () => import('./components/ChoiceRequirementsForm.vue'),
);
</script>

<style scoped lang="scss"></style>
```

Key changes: `useProjectStore` and `ObjectType` removed; `props` field removed from each `dispatchComponent` case; `v-model="choice"` added to the `<component>` tag in the template.

- [ ] **Step 6: Update `ChoiceScreen.vue` — use `useDraftObject`, pass `v-model="choice"` to children**

Replace the entire file:

```vue
<template>
  <Fluid>
    <div class="flex flex-col gap-2 items-stretch">
      <div class="flex flex-row gap-2">
        <IftaLabel class="grow">
          <InputText v-model.lazy="choice.name" />
          <label>Name</label>
        </IftaLabel>
        <IftaLabel>
          <InputText v-model="choice.id" disabled />
          <label>ID</label>
        </IftaLabel>
      </div>

      <div class="flex flex-col">
        <div class="border-b border-surface-700 pb-1 mb-2">
          <div class="text-xl font-bold text-primary">Header</div>
        </div>
        <ChoiceHeaderForm v-model="choice" />
      </div>
      <div class="flex flex-row gap-2">
        <div class="flex flex-col flex-2">
          <div class="border-b border-surface-700 pb-1 mb-2">
            <div class="text-xl font-bold text-primary">Components</div>
          </div>
          <ChoiceComponentsForm v-model="choice" />
        </div>
        <div class="flex flex-col flex-1">
          <div class="border-b border-surface-700 pb-1 mb-2">
            <div class="text-xl font-bold text-primary">Choice Styles</div>
          </div>
          <ChoiceStyleForm v-model="choice" />
        </div>
      </div>
    </div>
  </Fluid>
  <DataView
    :value="children"
    data-key="id"
    :dt="{ header: { padding: '1rem 0' }, content: { padding: '1rem 0' } }"
  >
    <template #header>
      <div class="flex flex-row justify-between items-center">
        <h3 class="text-xl font-bold text-primary">Addons</h3>
        <InputGroup class="w-auto min-w-8">
          <InputGroupAddon>
            <i class="iconify solar--filter-line-duotone" />
          </InputGroupAddon>
          <InputText v-model="searchRaw" size="small" />
          <InputGroupAddon>
            <Button
              icon="iconify solar--close-circle-line-duotone"
              severity="secondary"
              @click="searchRaw = ''"
            />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </template>
    <template #list="{ items }">
      <div class="grid grid-cols-3 gap-2">
        <AddonCard
          v-for="(item, index) in items"
          :key="index"
          :addon-id="item.id"
          :index="index as number"
        />
      </div>
    </template>
  </DataView>
</template>

<script setup lang="ts">
import { filter, includes, isEmpty, toLower } from 'ramda';

import ChoiceComponentsForm from '~/components/editor/screens/content/choice/ChoiceComponentsForm.vue';
import { useDraftObject } from '~/composables/editor/useDraftObject';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  choiceId: string;
}>();

const choice = useDraftObject(() => props.choiceId, ObjectType.choice);

const children = computed(() => {
  const _search = search.value;
  if (isEmpty(_search)) {
    return projectStore.getChildren(props.choiceId);
  } else {
    const _searchLC = toLower(_search);
    return filter(({ id }) => {
      const choice = projectStore.get(id, ObjectType.addon)!;
      return includes(_searchLC, toLower(choice.name));
    }, projectStore.getChildren(props.choiceId));
  }
});

const searchRaw = ref<string>('');
const search = refDebounced(searchRaw, 100);
</script>

<style scoped lang="scss"></style>
```

`type { ChoiceObject }` is removed (no longer referenced explicitly — type is inferred from `useDraftObject`). `useProjectStore` is kept for `getChildren` and the addon search.

- [ ] **Step 7: Verify lint passes for all 6 files**

```bash
yarn lint \
  app/components/editor/screens/content/choice/ChoiceHeaderForm.vue \
  app/components/editor/screens/content/choice/ChoiceStyleForm.vue \
  app/components/editor/screens/content/choice/components/ChoiceRequirementsForm.vue \
  app/components/editor/screens/content/choice/components/ChoiceScoreForm.vue \
  app/components/editor/screens/content/choice/ChoiceComponentsForm.vue \
  app/components/editor/screens/content/ChoiceScreen.vue
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add \
  app/components/editor/screens/content/choice/ChoiceHeaderForm.vue \
  app/components/editor/screens/content/choice/ChoiceStyleForm.vue \
  app/components/editor/screens/content/choice/components/ChoiceRequirementsForm.vue \
  app/components/editor/screens/content/choice/components/ChoiceScoreForm.vue \
  app/components/editor/screens/content/choice/ChoiceComponentsForm.vue \
  app/components/editor/screens/content/ChoiceScreen.vue
git commit -m "feat: migrate choice chain to useDraftObject"
```

---

## Task 2: Migrate the row chain

**Files:**
- Modify: `app/components/editor/screens/content/row/RowHeaderForm.vue`
- Modify: `app/components/editor/screens/content/row/RowLayoutForm.vue`
- Modify: `app/components/editor/screens/content/row/RowRequirementsForm.vue`
- Modify: `app/components/editor/screens/content/row/RowStyleForm.vue`
- Modify: `app/components/editor/screens/content/RowScreenHeader.vue`

- [ ] **Step 1: Update `RowHeaderForm.vue` — replace `rowId` prop with `defineModel`**

Replace the `<script setup>` block (template is unchanged):

```vue
<script setup lang="ts">
import { isNil } from 'ramda';

import RowImage from '~/components/editor/screens/content/row/RowImage.vue';
import type { RowObject } from '~/composables/project/types/v2/objects';

const row = defineModel<RowObject>({ required: true });
</script>
```

- [ ] **Step 2: Update `RowLayoutForm.vue` — replace `rowId` prop with `defineModel`**

Replace the `<script setup>` block (template is unchanged):

```vue
<script setup lang="ts">
import { GridItemPositions, GridItemWidths } from '~/composables/editor/const';
import type { RowObject } from '~/composables/project/types/v2/objects';

const row = defineModel<RowObject>({ required: true });
</script>
```

- [ ] **Step 3: Update `RowRequirementsForm.vue` — replace `rowId` prop with `defineModel`**

Replace the `<script setup>` block (template is unchanged):

```vue
<script setup lang="ts">
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions';
import { P, match } from 'ts-pattern';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import type { RowObject } from '~/composables/project/types/v2/objects';

const LazyEditConditionModal = defineAsyncComponent(
  () => import('~/components/editor/modals/EditConditionModal.vue'),
);
const $dialog = useDialog();

const row = defineModel<RowObject>({ required: true });

const doEditDisplayRequirements = () => {
  $dialog.open(LazyEditConditionModal, {
    data: {
      term: row.value.requirements.display,
    },
    onClose: (
      options: DynamicDialogCloseOptions<
        { update: ConditionTerm } | { remove: true }
      >,
    ) => {
      match(options.data)
        .with({ update: P.select() }, (term: ConditionTerm) => {
          row.value.requirements.display = term;
        })
        .with({ remove: true }, () => {
          row.value.requirements.display = undefined;
        })
        .otherwise(() => {});
    },
    props: {
      header: `Edit Requirements for ${row.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};

const doEditChoiceRequirements = () => {
  $dialog.open(LazyEditConditionModal, {
    data: {
      term: row.value.requirements.choices,
    },
    onClose: (
      options: DynamicDialogCloseOptions<
        { update: ConditionTerm } | { remove: true }
      >,
    ) => {
      match(options.data)
        .with({ update: P.select() }, (term: ConditionTerm) => {
          row.value.requirements.choices = term;
        })
        .with({ remove: true }, () => {
          row.value.requirements.choices = undefined;
        })
        .otherwise(() => {});
    },
    props: {
      header: `Edit Requirements for ${row.value.name}`,
      modal: true,
      draggable: false,
      position: 'top',
      style: { width: '60vw' },
    },
  });
};
</script>
```

`useProjectStore` and `ObjectType` are removed (were only used for the old `computed`).

- [ ] **Step 4: Update `RowStyleForm.vue` — replace `rowId` prop with `defineModel`**

Replace the `<script setup>` block (template is unchanged):

```vue
<script setup lang="ts">
import { append, equals, indexOf, isNotEmpty, reject, swap, uniq } from 'ramda';

import type { RowObject } from '~/composables/project/types/v2/objects';
import { StyleTarget } from '~/composables/project/types/v2/styles';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const row = defineModel<RowObject>({ required: true });

const rowStyles = computed(() => {
  return (row.value.styles ?? []).map((styleId) => {
    return projectStore.styles.rules[styleId];
  });
});
const addStyleId = ref();

const StylesList = computed(() => {
  return Object.values(projectStore.styles.rules).filter(
    (style) => style.target === StyleTarget.row,
  );
});

const doAddStyle = () => {
  if (!addStyleId.value) return;
  row.value.styles = uniq(append(addStyleId.value, row.value.styles ?? []));
  addStyleId.value = undefined;
};

const doRemoveStyle = (styleId: string) => {
  row.value.styles = reject(equals(styleId), row.value.styles ?? []);
};

const doMoveUp = (styleId: string) => {
  const idx = indexOf(styleId, row.value.styles ?? []);
  if (idx === -1 || idx === 0) return;
  row.value.styles = swap(idx, idx - 1, row.value.styles ?? []);
};
const doMoveDown = (styleId: string) => {
  const idx = indexOf(styleId, row.value.styles ?? []);
  if (idx === -1 || idx === (row.value.styles ?? []).length - 1) return;
  row.value.styles = swap(idx, idx + 1, row.value.styles ?? []);
};
</script>
```

`ObjectType` is removed (was only used in the old `computed`). `useProjectStore` is kept for `projectStore.styles.rules`.

- [ ] **Step 5: Update `RowScreenHeader.vue` — use `useDraftObject`, pass `v-model="row"` to children**

Replace the entire file:

```vue
<template>
  <div class="flex flex-col gap-2">
    <Fluid>
      <div class="flex flex-col gap-2 justify-stretch">
        <div class="flex flex-row gap-2">
          <IftaLabel class="grow">
            <InputText v-model.lazy="row.name" />
            <label>Name</label>
          </IftaLabel>
          <IftaLabel>
            <InputText v-model="row.id" disabled />
            <label>ID</label>
          </IftaLabel>
        </div>

        <div class="flex flex-col">
          <div
            class="border-b border-surface-700 pb-1 mb-2 flex flex-row justify-between items-center"
          >
            <div class="text-xl font-bold text-primary grow">Header</div>
            <div v-if="row.header" class="flex flex-row gap-2 items-center">
              <div class="flex flex-row gap-1 items-center">
                <Checkbox
                  v-model="row.header.isExtended"
                  binary
                  input-id="header-extended"
                />
                <label for="header-extended">Extended</label>
              </div>
              <Button
                variant="link"
                icon="iconify solar--trash-bin-trash-line-duotone"
                size="small"
                @click="deleteRowHeader"
              />
            </div>
          </div>
          <RowHeaderForm v-model="row" />
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="flex flex-col grow flex-1">
            <div class="border-b border-surface-700 pb-1 mb-2">
              <div class="text-xl font-bold text-primary">Layout</div>
            </div>
            <RowLayoutForm v-model="row" />
          </div>
          <div class="flex flex-col grow flex-1">
            <div class="border-b border-surface-700 pb-1 mb-2">
              <div class="text-xl font-bold text-primary">Requirements</div>
            </div>
            <RowRequirementsForm v-model="row" />
          </div>
          <div class="flex flex-col grow flex-1">
            <div class="border-b border-surface-700 pb-1 mb-2">
              <div class="text-xl font-bold text-primary">Row Styles</div>
            </div>
            <RowStyleForm v-model="row" />
          </div>
        </div>
      </div>
    </Fluid>
  </div>
</template>

<script setup lang="ts">
import RowRequirementsForm from '~/components/editor/screens/content/row/RowRequirementsForm.vue';
import { useDraftObject } from '~/composables/editor/useDraftObject';
import { ObjectType } from '~/composables/project/types/v2/objects/base';

const props = defineProps<{
  rowId: string;
}>();

const row = useDraftObject(() => props.rowId, ObjectType.row);

const deleteRowHeader = () => {
  row.value.header = undefined;
};
</script>
```

`useProjectStore` and `type { RowObject }` are removed. `ObjectType` is kept — it's passed to `useDraftObject`. `RowRequirementsForm` is kept as an explicit import (it was there before; the other row form components are Nuxt auto-imported).

- [ ] **Step 6: Verify lint passes for all 5 files**

```bash
yarn lint \
  app/components/editor/screens/content/row/RowHeaderForm.vue \
  app/components/editor/screens/content/row/RowLayoutForm.vue \
  app/components/editor/screens/content/row/RowRequirementsForm.vue \
  app/components/editor/screens/content/row/RowStyleForm.vue \
  app/components/editor/screens/content/RowScreenHeader.vue
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add \
  app/components/editor/screens/content/row/RowHeaderForm.vue \
  app/components/editor/screens/content/row/RowLayoutForm.vue \
  app/components/editor/screens/content/row/RowRequirementsForm.vue \
  app/components/editor/screens/content/row/RowStyleForm.vue \
  app/components/editor/screens/content/RowScreenHeader.vue
git commit -m "feat: migrate row chain to useDraftObject"
```

---

## Task 3: Migrate the style chain

**Files:**
- Modify: `app/components/editor/screens/styles/simple/EditSimpleContentStyle.vue`
- Modify: `app/components/editor/screens/styles/simple/EditSimpleStyle.vue`
- Modify: `app/components/editor/screens/styles/EditStyleScreen.vue`

**Type note:** `EditStyleScreen` holds a `Ref<AnyStyle>` (the union type). `EditSimpleStyle` and `EditSimpleContentStyle` receive this as `defineModel<AnyStyle>()` to avoid a TypeScript narrowing issue. Internally, `EditSimpleContentStyle` casts to `AnySimpleStyle` via a typed computed so its template can access `.contents.*` properties.

- [ ] **Step 1: Update `EditSimpleContentStyle.vue` — replace `styleId` prop with `defineModel`**

Replace the `<script setup>` block. The template replaces all `style.` references with `simpleStyle.` to use the typed computed:

```vue
<template>
  <!-- Contents Section -->
  <div class="flex flex-col gap-3">
    <div class="border-b border-surface-700 pb-1 mb-2">
      <div class="text-xl font-bold text-primary">Content</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div class="grid grid-cols-form gap-2">
        <label class="font-bold">Layout</label>
        <Select
          v-model="simpleStyle.contents.layout"
          :options="['list', 'grid']"
          fluid
        />
      </div>
      <div class="grid grid-cols-form gap-2">
        <label class="font-bold">Gap</label>
        <InputText v-model="simpleStyle.contents.gap" fluid />
      </div>
    </div>

    <!-- Contents Margins -->
    <div v-if="simpleStyle.contents.margins" class="flex flex-col gap-2">
      <div class="font-bold">Margins</div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div class="grid grid-cols-form gap-2">
          <label>Top</label>
          <InputText v-model="simpleStyle.contents.margins.top" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Right</label>
          <InputText v-model="simpleStyle.contents.margins.right" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Bottom</label>
          <InputText v-model="simpleStyle.contents.margins.bottom" fluid />
        </div>
        <div class="grid grid-cols-form gap-2">
          <label>Left</label>
          <InputText v-model="simpleStyle.contents.margins.left" fluid />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnySimpleStyle, AnyStyle } from '~/composables/project/types/v2/styles';

const style = defineModel<AnyStyle>({ required: true });
const simpleStyle = computed((): AnySimpleStyle => style.value as AnySimpleStyle);
</script>

<style scoped lang="scss"></style>
```

`simpleStyle` is a readonly computed that casts the draft to `AnySimpleStyle`. `v-model` bindings on `simpleStyle.contents.*` mutate the underlying object in-place through the shared reference — no setter needed.

- [ ] **Step 2: Update `EditSimpleStyle.vue` — replace `styleId` prop with `defineModel`, pass `v-model` to children**

Replace the entire file:

```vue
<template>
  <div class="flex flex-col gap-4">
    <EditSimpleHeaderStyle v-model="style" />
    <EditSimpleContentStyle v-model="style" />
  </div>
</template>

<script setup lang="ts">
import type { AnyStyle } from '~/composables/project/types/v2/styles';

const style = defineModel<AnyStyle>({ required: true });
</script>

<style scoped lang="scss"></style>
```

- [ ] **Step 3: Update `EditStyleScreen.vue` — use `useDraftStyle`**

Replace the `<script setup>` block (template is unchanged — it already has `v-model="style"` for `SimpleStyleForm` and `v-model="style.name"` / `v-model="style.comment"` directly):

```vue
<script setup lang="ts">
import { StyleType } from '~/composables/project/types/v2/styles';
import { useDraftStyle } from '~/composables/editor/useDraftStyle';

const props = defineProps<{
  styleId: string;
}>();

const style = useDraftStyle(() => props.styleId);
</script>
```

`useProjectStore` is removed — it was only used for the old `computed`.

- [ ] **Step 4: Verify lint passes for all 3 files**

```bash
yarn lint \
  app/components/editor/screens/styles/simple/EditSimpleContentStyle.vue \
  app/components/editor/screens/styles/simple/EditSimpleStyle.vue \
  app/components/editor/screens/styles/EditStyleScreen.vue
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add \
  app/components/editor/screens/styles/simple/EditSimpleContentStyle.vue \
  app/components/editor/screens/styles/simple/EditSimpleStyle.vue \
  app/components/editor/screens/styles/EditStyleScreen.vue
git commit -m "feat: migrate style chain to useDraftStyle"
```

---

## Task 4: Migrate `PageScreen`

**Files:**
- Modify: `app/components/editor/screens/content/PageScreen.vue`

- [ ] **Step 1: Update `PageScreen.vue` — use `useDraftObject`**

Replace the entire file:

```vue
<template>
  <div class="flex flex-col gap-2">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div class="grid grid-cols-form gap-2 items-center">
        <label class="font-bold" for="pageName">Name</label>
        <InputText v-model="page.name" fluid />
      </div>
      <div>Layout</div>
      <div>Style</div>
    </div>
    <DataView
      :value="children"
      data-key="id"
      :dt="{ header: { padding: '1rem 0' } }"
    >
      <template #header>
        <div class="flex flex-row justify-between items-center">
          <h3 class="text-xl font-bold text-primary">Rows</h3>
          <InputGroup class="w-auto min-w-8">
            <InputGroupAddon>
              <i class="iconify solar--filter-line-duotone" />
            </InputGroupAddon>
            <InputText v-model="searchRaw" size="small" />
            <InputGroupAddon>
              <Button
                icon="iconify solar--close-circle-line-duotone"
                severity="secondary"
                @click="searchRaw = ''"
              />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </template>
      <template #list="{ items }">
        <div class="flex flex-col">
          <RowCard
            v-for="(item, index) in items"
            :key="index"
            :row-id="item.id"
            :index="index as number"
            :class="{
              'border-t border-surface-200 dark:border-surface-700':
                index !== 0,
            }"
          />
        </div>
      </template>
    </DataView>
  </div>
</template>

<script setup lang="ts">
import { filter, includes, isEmpty, toLower } from 'ramda';

import { useDraftObject } from '~/composables/editor/useDraftObject';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  pageId: string;
}>();

const page = useDraftObject(() => props.pageId, ObjectType.page);

const children = computed(() => {
  const _search = search.value;
  if (isEmpty(_search)) {
    return projectStore.getChildren(props.pageId);
  } else {
    const _searchLC = toLower(_search);
    return filter(({ id }) => {
      const row = projectStore.get(id, ObjectType.row)!;
      return includes(_searchLC, toLower(row.name));
    }, projectStore.getChildren(props.pageId));
  }
});

const searchRaw = ref<string>('');
const search = refDebounced(searchRaw, 100);
</script>

<style scoped lang="scss"></style>
```

`useProjectStore` is kept for `getChildren` and the row search. `ObjectType` is kept — used in `useDraftObject` and the row search.

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint app/components/editor/screens/content/PageScreen.vue
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/editor/screens/content/PageScreen.vue
git commit -m "feat: migrate PageScreen to useDraftObject"
```
