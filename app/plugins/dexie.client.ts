import { defineNuxtPlugin } from '#app/nuxt';
import { DexieProvider, createDexie } from '~/composables/shared/useDexie';

export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.vueApp.provide(DexieProvider, createDexie());
});
