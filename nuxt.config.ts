// https://nuxt.com/docs/api/configuration/nuxt-config
import { championNames, nameToId } from "./constants/championNames"
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
      for (const c of Object.keys(nameToId)) {
        arr.push(`/champions/${c.toLowerCase()}`)
      }
      return arr
    }
  },

  devtools: {
    enabled: true
  },

  routeRules: {
    // '/champions': { swr: 1800 },
    // '/champions/**': { swr: 1800 },
    '/summoner/**': { ssr: false},
    '/api/**': { cors: false },
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/sitemap',
    'nuxt-gtag',
    '@sentry/nuxt/module'
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
  sentry: {
    sourceMapsUploadOptions: {
      org: 'aramstats',
      project: 'javascript-nuxt',
      sourcemaps: {
        filesToDeleteAfterUpload: [
          ".output/public/**/*.map",
          ".output/server/**/*.map",
        ]
      }
      // telemetry: false
    },
    enabled: process.env.NODE_ENV !== 'development',
  },

  sourcemap: {
    client: 'hidden',
  },
})