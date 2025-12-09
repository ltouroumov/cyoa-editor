<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { useDexie } from '~/composables/shared/useDexie';

const db = useDexie();

const selectedTable = ref<string>('viewer_builds');
const tableData = ref<any[]>([]);
const tableColumns = ref<string[]>([]);
const loadingTable = ref(false);

const tables = [
  'viewer_builds',
  'viewer_projects_cache',
  'editor_projects',
  'editor_projects_versions',
];

async function loadTable(tableName: string) {
  loadingTable.value = true;
  try {
    const data = await db.table(tableName).toArray();
    tableData.value = data;

    if (data.length > 0) {
      tableColumns.value = Object.keys(data[0]);
    } else {
      tableColumns.value = [];
    }
  } catch (error) {
    console.error('Error loading table:', error);
    tableData.value = [];
    tableColumns.value = [];
  } finally {
    loadingTable.value = false;
  }
}

async function deleteTableRecord(tableName: string, id: number) {
  if (!confirm(`Delete record with ID ${id}?`)) return;

  try {
    await db.table(tableName).delete(id);
    await loadTable(tableName);
  } catch (error) {
    console.error('Error deleting record:', error);
    alert('Error deleting record');
  }
}

async function clearTable(tableName: string) {
  if (!confirm(`Clear all data from ${tableName}?`)) return;

  try {
    await db.table(tableName).clear();
    await loadTable(tableName);
  } catch (error) {
    console.error('Error clearing table:', error);
    alert('Error clearing table');
  }
}

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

onMounted(async () => {
  await loadTable(selectedTable.value);
});

watch(selectedTable, async (newTable) => {
  await loadTable(newTable);
});
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
      IndexedDB Tables
    </h2>

    <div class="mb-4 flex items-center gap-4">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Table:
      </label>
      <select
        v-model="selectedTable"
        class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option v-for="table in tables" :key="table" :value="table">
          {{ table }}
        </option>
      </select>

      <button
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        @click="clearTable(selectedTable)"
      >
        Clear Table
      </button>
    </div>

    <div
      v-if="loadingTable"
      class="text-center py-8 text-gray-600 dark:text-gray-400"
    >
      Loading...
    </div>

    <div
      v-else-if="tableData.length === 0"
      class="text-center py-8 text-gray-600 dark:text-gray-400"
    >
      No data in this table
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              v-for="column in tableColumns"
              :key="column"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {{ column }}
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <tr v-for="row in tableData" :key="row.id">
            <td
              v-for="column in tableColumns"
              :key="column"
              class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate"
              :title="formatValue(row[column])"
            >
              <pre
                v-if="typeof row[column] === 'object'"
                class="text-xs"
                >{{ formatValue(row[column]) }}</pre
              >
              <span v-else>{{ formatValue(row[column]) }}</span>
            </td>
            <td class="px-4 py-3 text-sm">
              <button
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                @click="deleteTableRecord(selectedTable, row.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total records: {{ tableData.length }}
      </div>
    </div>
  </div>
</template>
