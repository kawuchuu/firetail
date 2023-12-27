<script>
import SubtitleOption from "../options/SubtitleOption.vue";
import DropdownOption from "../options/DropdownOption.vue";

export default {
    name: "GeneralSection",
    components: {
        DropdownOption,
        SubtitleOption
    },
    data() {
        return {
            locales: [{label: "Auto", value: "system"}],
            startPages: [
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.HOME', value: 'home' },
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.SONGS', value: 'songs' },
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.ARTISTS', value: 'artists' },
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.ALBUMS', value: 'albums' },
                { label: 'SETTINGS.DROP_DOWN.START_SCREEN.FAVOURITES', value: 'favourites' },
            ],
        }
    },
    methods: {
        changeLocale(locale) {
            if (locale.value === 'system') locale = {value: window.navigator.language}
            this.$root.$i18n.locale = locale.value
        }
    },
    mounted() {
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
        <DropdownOption :label="$t('SETTINGS.LANGUAGE')" :init-selected="locales[0]" :options="locales" :on-change="changeLocale"/>
        <DropdownOption :label="$t('SETTINGS.START_PAGE')" :init-selected="startPages[1]" :options="startPages"/>
    </section>
</template>

<style scoped lang="scss">

</style>