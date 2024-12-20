<script>
import SubtitleOption from "../options/SubtitleOption.vue";
import DropdownOption from "../options/DropdownOption.vue";
import ButtonOption from "../options/ButtonOption.vue";

export default {
    name: "GeneralSection",
    components: {
      ButtonOption,
        DropdownOption,
        SubtitleOption
    },
    data() {
        return {
            locales: [{label: 'SETTINGS.DROP_DOWN.LANG_AUTO', value: "system"}],
            startPages: [
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.HOME', value: 'home' },
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.SONGS', value: 'songs' },
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.ARTISTS', value: 'artists' },
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.ALBUMS', value: 'albums' },
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.FAVOURITES', value: 'favourites' },
            ],
            currentLocale: {label: 'SETTINGS.DROP_DOWN.LANG_AUTO', value: "system"},
          platform: window.process.platform,
        }
    },
    methods: {
        changeLocale(locale) {
            if (locale.value === 'system') locale = {value: window.navigator.language}
            this.$root.$i18n.locale = locale.value
            if (this.$i18n.messages[locale.value]['RTL']) {
                if (!this.$store.state.nav.rtl) this.$store.commit('panel/showNewPrompt', {title: this.$t('PANEL.PROMPT.RESTART.TITLE'), message: this.$t('PANEL.PROMPT.RESTART.MESSAGE'), buttons: 'dismiss'})
                this.$store.commit('nav/updateRTL', true)
            } else {
                if (this.$store.state.nav.rtl) this.$store.commit('panel/showNewPrompt', {title: this.$t('PANEL.PROMPT.RESTART.TITLE'), message: this.$t('PANEL.PROMPT.RESTART.MESSAGE'), buttons: 'dismiss'})
                this.$store.commit('nav/updateRTL', false)
            }
        },
        clearLibrary() {
            this.$store.commit('panel/showNewPrompt', {title: this.$t('PANEL.PROMPT.CLEAR_LIBRARY.TITLE'), message: this.$t('PANEL.PROMPT.CLEAR_LIBRARY.MESSAGE'), buttons: 'clearLibrary'})
        }
    },
    created() {
        const result = window.ftStoreSync.getItem('lang')
        console.log('ITEM IS ' + result)
        console.log(this)
        if (result !== 'system') this.currentLocale = {label: this.$root.$i18n.messages[this.$root.$i18n.locale].LANG_NAME, value: this.$root.$i18n.locale}
        this.$i18n.availableLocales.forEach(locale => {
            if (this.$i18n.messages[locale].LANG_NAME === "") this.locales.push({label: locale, value: locale})
            else this.locales.push({label: this.$i18n.messages[locale].LANG_NAME, value: locale})
        })
    }
}
</script>

<template>
    <section class="general">
        <SubtitleOption>{{$t('SETTINGS.SUBTITLES.GENERAL')}}</SubtitleOption>
        <DropdownOption :label="$t('SETTINGS.LANGUAGE')" :store-key="'lang'" :store-category="'multiOption'" :init-selected="currentLocale" :options="locales" :on-change="changeLocale"/>
<!--        <DropdownOption :label="$t('SETTINGS.START_PAGE')" :init-selected="startPages[1]" :options="startPages"/>-->
        <ButtonOption :action="clearLibrary" :label="$t('SETTINGS.CLEAR_LIBRARY')" :btn-label="this.$t('SETTINGS.BUTTON.CLEAR_LIBRARY')" />
        <ButtonOption v-if="platform !== 'linux'" :label="$t('SETTINGS.CHECK_UPDATE')" :btn-label="$t('SETTINGS.BUTTON.CHECK_UPDATE')" />
    </section>
</template>

<style scoped lang="scss">

</style>