export const SYSTEM_LOCALE = 'system';
const FALLBACK_LOCALE = 'en-GB';

export function getSavedLocalePref(): string {
    if (window.ftStoreSync.keyExists('lang')) {
        const value = window.ftStoreSync.getItem('lang');
        if (typeof value === 'string' && value) return value;
    }
    return SYSTEM_LOCALE;
}

export function resolveLocale(pref: string, available: readonly string[]): string {
    const wanted = pref === SYSTEM_LOCALE ? navigator.language : pref;
    if (available.includes(wanted)) return wanted;
    const base = wanted.split('-')[0].toLowerCase();
    const sameBase = available.filter(l => l.split('-')[0].toLowerCase() === base);
    if (sameBase.includes(base)) return base;
    if (sameBase.includes(FALLBACK_LOCALE)) return FALLBACK_LOCALE;
    if (sameBase.length) return sameBase[0];
    return available.includes(FALLBACK_LOCALE) ? FALLBACK_LOCALE : (available[0] ?? FALLBACK_LOCALE);
}

export function applyLocaleToDocument(locale: string, messages: Record<string, unknown>) {
    const localeMessages = messages[locale] as Record<string, unknown> | undefined;
    document.documentElement.lang = locale;
    document.documentElement.classList.toggle('rtl', localeMessages?.RTL === true);
}
