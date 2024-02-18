import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'ja',
      },
    },
  },
  auth: {
    globalAppMiddleware: true,
    provider: {
      type: 'local',
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@sidebase/nuxt-auth',
  ],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})
