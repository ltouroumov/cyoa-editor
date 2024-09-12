import VueToastificationPlugin, {
  POSITION,
  useToast,
} from 'vue-toastification';

import { defineNuxtPlugin } from '#app/nuxt';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueToastificationPlugin, {
    position: POSITION.TOP_RIGHT,
  });

  const toast = useToast();
  return {
    provide: { toast },
  };
});
