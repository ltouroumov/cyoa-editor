<template>
  <div class="choices-list">
    <template v-for="(row, idx) in groups" :key="row.rowId">
      <span v-if="idx > 0" class="group-spacer">|</span>
      <strong class="choice-group-title">{{ row.title }}:</strong>
      <template v-for="(item, idx2) in row.items" :key="item.objId">
        <span class="choice-name">
          {{ item.title }}
          <span v-if="item.count > 1" class="choice-count">
            (x{{ item.count }})
          </span>
        </span>
        <span v-if="idx2 < row.items.length - 1" class="choice-spacer">,</span>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SavedBuildGroup } from '~/composables/shared/tables/builds';

defineProps<{
  groups: SavedBuildGroup[];
}>();
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

.choices-list {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.1rem;

  .choice-group-title {
    margin-right: 0.2rem;
  }

  .choice-spacer {
    margin-right: 0.2rem;
  }

  .group-spacer {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
  }
}
</style>
