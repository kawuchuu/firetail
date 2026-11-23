import { createI18n } from "vue-i18n";
import {applyLocaleToDocument, getSavedLocalePref, resolveLocale} from "./modules/locale";

const loadLocaleMessages = async () => {
    //const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
    const locales = import.meta.glob('./locales/*.json');
    const messages = {}
    const localeKey = Object.keys(locales);
    for (const item in localeKey) {
        const matched = localeKey[item].match(/([A-Za-z0-9-_]+)\./i)
        if (matched && matched.length > 1) {
            const locale = matched[1]
            messages[locale] = await locales[localeKey[item]]()
        }
    }

    return messages
}

export async function setupI18n() {
    const messages = await loadLocaleMessages();
    const locale = resolveLocale(getSavedLocalePref(), Object.keys(messages));
    applyLocaleToDocument(locale, messages);
    return createI18n({
        locale,
        fallbackLocale: 'en-GB',
        messages,
        silentTranslationWarn: true,
        silentFallbackWarn: true,
        fallbackRoot: true,
        fallbackRootWithEmptyString: true,
        legacy: false
    });
}

//export default i18n;