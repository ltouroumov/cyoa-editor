// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  imports: { autoImport: true },
  css: [
    '@unocss/reset/normalize.css',
    '~/assets/css/bootstrap.scss',
    '~/assets/css/main.css'
  ],
  devtools: { enabled: true },
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
  ]
})
