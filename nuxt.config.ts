// https://nuxt.com/docs/api/configuration/nuxt-config
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
        { children: 'JavaScript is required' },
      ],
    },
  },

  ssr: false,
  imports: { autoImport: true },

  css: [
    '@unocss/reset/normalize.css',
    '~/assets/css/bootstrap/global.scss',
    '~/assets/css/toast.scss',
    '~/assets/css/main.css',
  ],

  plugins: ['~/plugins/toast.client.ts'],
  devtools: { enabled: false },
  typescript: { typeCheck: true },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],
  compatibilityDate: '2024-09-04',
});
