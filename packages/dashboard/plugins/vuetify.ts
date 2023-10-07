import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as directives from 'vuetify/directives'
import { VDataTable } from 'vuetify/labs/VDataTable'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components: {
      VDataTable,
    },
    directives,
    // 他の設定をここに記述していく
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
  })

  // Vue.js で Vuetify を使用する
  nuxtApp.vueApp.use(vuetify)
})
