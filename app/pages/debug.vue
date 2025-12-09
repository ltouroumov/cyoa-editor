<script setup lang="ts">
definePageMeta({
  ssr: false,
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center">
    <div class="max-w-[1200px] w-full bg-surface-900 grow">
      <h1 class="text-2xl text-primary-500 p-4">Debug Menu</h1>
      <Tabs value="indexeddb">
        <TabList>
          <Tab value="indexeddb">IndexedDB</Tab>
          <Tab value="opfs">OPFS</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="indexeddb">
            <IndexedDbExplorer />
          </TabPanel>

          <TabPanel value="opfs">
            <OpfsExplorer />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>
