// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'ARAM Stats',
      htmlAttrs: {
        lang: 'en'
      }
    }
  },

  devtools: {
    enabled: true
  },

  routeRules: {
    '/champions': { swr: 1800 },
    '/champions/**': { swr: 1800 },
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: ['@pinia/nuxt'],

  vite: {
    assetsInclude: ['**/*.glb'],
  },

  css: [
    '~/assets/css/main.css'
  ],

  compatibilityDate: '2025-03-05',
})