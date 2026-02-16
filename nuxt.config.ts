// https://nuxt.com/docs/api/configuration/nuxt-config

import { GoldMorning } from './prime/gold-morning.style.mjs';

export default defineNuxtConfig({
  app: {
    baseURL:
      process.env.NUXT_APP_BASE_URL ??
      (process.env.NODE_ENV === 'production' ? '/cyoa-editor/' : '/'),
    buildAssetsDir: 'assets',
    head: {
      title: 'Interactive CYOA',
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: 'favicon.ico',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: 'favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: 'favicon-16x16.png',
        },
        {
          rel: 'android-chrome',
          type: 'image/png',
          sizes: '92x192',
          href: 'android-chrome-92x192.png',
        },
        {
          rel: 'andriod-chrome',
          type: 'image/png',
          sizes: '512x512',
          href: 'android-chrome-512x512.png',
        },
        {
          rel: 'apple-touch-icon',
          type: 'image/png',
          sizes: '180x180',
          href: 'apple-touch-icon.png',
        },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      noscript: [
        // <noscript>JavaScript is required</noscript>
        { textContent: 'JavaScript is required' },
      ],
      htmlAttrs: {
        class: 'dark-theme',
      },
    },
  },

  ssr: false,
  imports: { autoImport: true },

  css: ['~/assets/css/main.css', 'primeicons/primeicons.css'],

  plugins: [],
  // LT: Disabled because the performance hit on reactivity is way too high
  devtools: { enabled: false },
  typescript: { typeCheck: true },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@primevue/nuxt-module',
    '@vueuse/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],

  primevue: {
    usePrimeVue: true,
    autoImport: true,
    components: {
      exclude: ['Chart', 'Form', 'FormField'],
    },
    options: {
      theme: {
        preset: GoldMorning,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark-theme',
          cssLayer: {
            name: 'primevue',
            order: 'base, primevue',
          },
        },
      },
    },
  },

  compatibilityDate: '2025-11-28',
});
