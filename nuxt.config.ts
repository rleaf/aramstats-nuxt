// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true
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
})