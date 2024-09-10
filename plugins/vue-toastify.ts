import { defineNuxtPlugin } from '#app/nuxt';
import VueToastificationPlugin from 'vue-toastification';

export default defineNuxtPlugin({
  name: 'vue-toastify',
  setup(nuxtApp) {
    nuxtApp.vueApp.use(VueToastificationPlugin);
  },
});
