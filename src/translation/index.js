import Vue from 'vue'
import VueI18n from 'vue-i18n'
//import {ipcRenderer} from 'electron'

Vue.use(VueI18n)

let loadLocaleMessages = () => {
    const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
    console.log(locales.keys())
    const messages = {}
    locales.keys().forEach(key => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i)
        if (matched && matched.length > 1) {
            const locale = matched[1]
            messages[locale] = locales(key)
        }
    })
    return messages
}

/* let getLocale = async () => {
    let locale = await window.ipcRenderer.invoke('hasCustomLanguage')
    console.log(locale)
    if (locale) {
        i18n.locale = locale
    } else {
        i18n.locale = navigator.language.split('-')[0]
    }
}
getLocale() */

let i18n = new VueI18n({
    locale: navigator.language,
    fallbackLocale: 'en-US',
    messages: loadLocaleMessages(),
    silentFallbackWarn: true,
})

export default i18n