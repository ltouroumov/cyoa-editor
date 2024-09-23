import { defineNuxtPlugin } from '#app/nuxt';
import { IndexedDB } from '~/composables/utils/idb';
import { indexedDBProvider } from '~/composables/viewer/useIndexedDB';

export default defineNuxtPlugin(async (nuxtApp) => {
  const db = await IndexedDB.open('cyoa-editor', 1, (db) => {
    db.createObjectStore('builds', { keyPath: 'id', autoIncrement: true });
  });
  nuxtApp.vueApp.provide(indexedDBProvider, db);
});
