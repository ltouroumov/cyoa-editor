<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-2">
      <AutoComplete
        v-model="choiceEntry"
        placeholder="Search for a choice"
        :suggestions="choiceItems"
        option-label="label"
        :show-clear="true"
        input-class="w-full"
        @complete="choiceSearch"
      />
      <div class="flex flex-row gap-2">
        <Button variant="outlined" @click="commitChoice('isSelected')">
          Is Selected
        </Button>
        <Button variant="outlined">Not Selected</Button>
      </div>
    </div>
    <div class="border-t border-surface-500 my-2"></div>
    <div class="flex flex-col gap-2">
      <Button variant="outlined" @click="commit({ allOf: [] })">
        All are True (AND)
      </Button>
      <Button variant="outlined" @click="commit({ anyOf: [] })">
        Any is True (OR)
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import { assoc, includes } from 'ramda';

import type { ConditionTerm } from '~/composables/project/types/v2/condition';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const $project = useProjectStore();

const dialogRef = inject<Ref<{ close(data: any): void }>>('dialogRef')!;

type CompleteItem = { choiceId: string; label: string };
const choiceEntry = ref<CompleteItem | null>(null);
const choiceItems = ref<CompleteItem[]>([]);
const choiceSearch = (event: AutoCompleteCompleteEvent) => {
  if (event.query) {
    const query = event.query.toLowerCase();
    const choices: CompleteItem[] = [];
    for (const entry of $project.objects.values()) {
      if (entry.type !== ObjectType.choice) continue;

      if (
        includes(query, entry.name.toLowerCase()) ||
        includes(query, entry.id.toLowerCase()) ||
        includes(query, (entry.header?.title || '').toLowerCase())
      ) {
        choices.push({
          choiceId: entry.id,
          label: `${entry.name} (${entry.id})`,
        });
      }

      if (choices.length > 20) {
        break;
      }
    }
    choiceItems.value = choices;
  } else {
    choiceItems.value = [];
  }
};

const commitChoice = (key: string) => {
  if (choiceEntry.value) {
    const { choiceId } = choiceEntry.value;
    dialogRef.value.close({ result: assoc(key, choiceId, {}) });
  }
};

const commit = (data: ConditionTerm) => {
  dialogRef.value.close({ result: data });
};
</script>

<style scoped lang="scss"></style>
