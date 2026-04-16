<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface OpfsEntry {
  name: string;
  type: 'directory' | 'file';
  handle: FileSystemHandle;
  size?: number;
  children?: OpfsEntry[];
}

const opfsDirectories = ref<OpfsEntry[]>([]);
const loadingOpfs = ref(false);

const isDirectoryHandle = (
  handle: FileSystemHandle,
): handle is FileSystemDirectoryHandle => handle.kind === 'directory';

const isFileHandle = (
  handle: FileSystemHandle,
): handle is FileSystemFileHandle => handle.kind === 'file';

async function loadOpfsStructure() {
  loadingOpfs.value = true;

  try {
    const root = await navigator.storage.getDirectory();
    const entries: OpfsEntry[] = [];

    for await (const [name, handle] of root.entries()) {
      if (isDirectoryHandle(handle)) {
        const subEntries = await listDirectory(handle);
        entries.push({
          name,
          type: 'directory',
          handle,
          children: subEntries,
        });
      } else if (isFileHandle(handle)) {
        const file = await handle.getFile();
        entries.push({
          name,
          type: 'file',
          handle,
          size: file.size,
        });
      }
    }

    opfsDirectories.value = entries;
  } catch (error) {
    console.error('Error loading OPFS:', error);
    opfsDirectories.value = [];
  } finally {
    loadingOpfs.value = false;
  }
}

async function listDirectory(
  dirHandle: FileSystemDirectoryHandle,
): Promise<OpfsEntry[]> {
  const entries: OpfsEntry[] = [];

  for await (const [name, handle] of dirHandle.entries()) {
    if (isDirectoryHandle(handle)) {
      const subEntries = await listDirectory(handle);
      entries.push({
        name,
        type: 'directory',
        handle,
        children: subEntries,
      });
    } else if (isFileHandle(handle)) {
      const file = await handle.getFile();
      entries.push({
        name,
        type: 'file',
        handle,
        size: file.size,
      });
    }
  }

  return entries;
}

async function deleteOpfsDirectory(dirName: string) {
  if (!confirm(`Delete OPFS directory "${dirName}" and all its contents?`))
    return;

  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(dirName, { recursive: true });
    await loadOpfsStructure();
  } catch (error) {
    console.error('Error deleting directory:', error);
    alert('Error deleting directory');
  }
}

async function clearAllOpfs() {
  if (!confirm('Delete ALL OPFS data? This cannot be undone!')) return;

  try {
    const root = await navigator.storage.getDirectory();

    for await (const [name] of root.entries()) {
      await root.removeEntry(name, { recursive: true });
    }

    await loadOpfsStructure();
  } catch (error) {
    console.error('Error clearing OPFS:', error);
    alert('Error clearing OPFS');
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

onMounted(async () => {
  await loadOpfsStructure();
});

defineExpose({
  loadOpfsStructure,
});
</script>

<template>
  <div class="flex flex-col">
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
      OPFS (Origin Private File System)
    </h2>

    <div class="mb-4 flex items-center gap-4">
      <button
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        @click="loadOpfsStructure"
      >
        Refresh
      </button>

      <button
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        @click="clearAllOpfs"
      >
        Clear All OPFS
      </button>
    </div>

    <div
      v-if="loadingOpfs"
      class="text-center py-8 text-gray-600 dark:text-gray-400"
    >
      Loading...
    </div>

    <div
      v-else-if="opfsDirectories.length === 0"
      class="text-center py-8 text-gray-600 dark:text-gray-400"
    >
      No files or directories in OPFS
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="entry in opfsDirectories"
        :key="entry.name"
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">📁</span>
            <span class="font-semibold text-gray-900 dark:text-gray-100">
              {{ entry.name }}
            </span>
            <span
              v-if="entry.type === 'file' && entry.size !== undefined"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              ({{ formatBytes(entry.size) }})
            </span>
          </div>

          <button
            class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
            @click="deleteOpfsDirectory(entry.name)"
          >
            Delete
          </button>
        </div>

        <!-- Nested children -->
        <div
          v-if="entry.children && entry.children.length > 0"
          class="ml-6 mt-2 space-y-2"
        >
          <div
            v-for="child in entry.children"
            :key="child.name"
            class="text-sm"
          >
            <div class="flex items-center gap-2">
              <span>{{ child.type === 'directory' ? '📁' : '📄' }}</span>
              <span class="text-gray-700 dark:text-gray-300">{{
                child.name
              }}</span>
              <span
                v-if="child.type === 'file' && child.size !== undefined"
                class="text-gray-500 dark:text-gray-400"
              >
                ({{ formatBytes(child.size) }})
              </span>
            </div>

            <!-- Show files in subdirectories -->
            <div
              v-if="child.children && child.children.length > 0"
              class="ml-6 mt-1 space-y-1"
            >
              <div
                v-for="subChild in child.children"
                :key="subChild.name"
                class="flex items-center gap-2 text-xs"
              >
                <span>📄</span>
                <span class="text-gray-600 dark:text-gray-400">{{
                  subChild.name
                }}</span>
                <span
                  v-if="subChild.size !== undefined"
                  class="text-gray-500 dark:text-gray-500"
                >
                  ({{ formatBytes(subChild.size) }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
