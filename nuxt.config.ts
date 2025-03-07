// https://nuxt.com/docs/api/configuration/nuxt-config
import { championNames } from "./constants/championNames"
export default defineNuxtConfig({
  app: {
    head: {
      title: 'ARAM Stats',
      htmlAttrs: {
        lang: 'en'
      }
    }
  },
  site: {
    url: 'https://aramstats.lol',
    name: 'ARAM Stats',
  },
  sitemap: {
    urls: () => {
      let arr = []
      for (const c of Object.values(championNames)) {
        arr.push(`/champions/${c[0].toLowerCase()}`)
      }
      return arr
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
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/sitemap',
    'nuxt-gtag',
  ],
  gtag: {
    id: 'G-PD6QYJ923C'
  },
  vite: {
    assetsInclude: ['**/*.glb'],
  },
  css: [
    '~/assets/css/main.css'
  ],
  compatibilityDate: '2025-03-05',
})