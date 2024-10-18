import { defineNuxtPlugin } from '#app/nuxt';
import { DexieProvider, createDexie } from '~/composables/viewer/useDexie';

export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.vueApp.provide(DexieProvider, createDexie());
});
