import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        ssr: true,
        components,
        directives,
        // 他の設定をここに記述していく
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi,
            }
        }
    })

    // Vue.js で Vuetify を使用する
    nuxtApp.vueApp.use(vuetify)
})
