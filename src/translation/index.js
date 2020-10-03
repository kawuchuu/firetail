import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const i18n = new VueI18n({
    locale: 'en',
    messages: {
        en: {
            home: 'Home',
            library: 'Library'
        }
    }
})

export default i18n