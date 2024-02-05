// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/cyoa-editor/',
    buildAssetsDir: 'assets',
    head: {
      title: 'Interactive CYOA',
    },
  },
  imports: { autoImport: true },
  css: [
    '@unocss/reset/normalize.css',
    '~/assets/css/bootstrap/global.scss',
    '~/assets/css/main.css',
  ],
  plugins: [],
  devtools: { enabled: true },
  typescript: { typeCheck: true },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  modules: ['@unocss/nuxt', '@pinia/nuxt', '@vueuse/nuxt'],
});
