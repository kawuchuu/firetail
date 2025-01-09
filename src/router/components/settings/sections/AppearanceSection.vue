<script>
import SubtitleOption from "../options/SubtitleOption.vue";
import DropdownOption from "../options/DropdownOption.vue";
import SwitchOption from "../options/SwitchOption.vue";
export default {
    name: "AppearanceSection",
    components: {
        SwitchOption,
        DropdownOption,
        SubtitleOption
    },
    data() {
        return {
            themes: [
                { label: 'SETTINGS.DROP_DOWN.COLOUR_THEME.SYSTEM', value: 'system' },
                { label: 'SETTINGS.DROP_DOWN.COLOUR_THEME.DARK', value: 'dark' },
                { label: 'SETTINGS.DROP_DOWN.COLOUR_THEME.LIGHT', value: 'light' },
            ],
            selectedTheme: null
        }
    },
    beforeMount() {
        this.selectedTheme = this.themes.find(item => item.value === window.localStorage.getItem('theme'))
    },
    methods: {
        changeTheme(option) {
            window.localStorage.setItem('theme', option.value)
            // this manual setting of colour for the title bar is temporary :)
            switch(option.value) {
                case 'light':
                    document.documentElement.classList.remove('dark')
                    document.documentElement.classList.add('light')
                    window.ipcRenderer.send('colour-theme-change', {
                        bg: '#e8e5f3',
                        fg: '#242424',
                        blurFg: '#24242480'
                    })
                    break
                case 'dark':
                    document.documentElement.classList.remove('light')
                    document.documentElement.classList.add('dark')
                    window.ipcRenderer.send('colour-theme-change', {
                        bg: '#000000',
                        fg: '#ffffff',
                        blurFg: '#ffffff80'
                    })
                    break
                case 'system':
                    if (window.matchMedia("(prefers-color-scheme: light").matches) {
                        document.documentElement.classList.remove('dark')
                        document.documentElement.classList.add('light')
                    } else {
                        document.documentElement.classList.remove('light')
                        document.documentElement.classList.add('dark')
                    }
                    window.ipcRenderer.send('colour-theme-change', {
                        bg: '#000000',
                        fg: '#ffffff',
                        blurFg: '#ffffff80'
                    })
                    break
                default:
                    window.localStorage.setItem('theme', 'system')
                    if (window.matchMedia("(prefers-color-scheme: light").matches) {
                        document.documentElement.classList.remove('dark')
                        document.documentElement.classList.add('light')
                    } else {
                        document.documentElement.classList.remove('light')
                        document.documentElement.classList.add('dark')
                    }
                    window.ipcRenderer.send('colour-theme-change', {
                        bg: '#000000',
                        fg: '#ffffff',
                        blurFg: '#ffffff80'
                    })
            }
        }
    }
}
</script>

<template>
    <section class="appearance-section">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.APPEARANCE")}}</SubtitleOption>
        <DropdownOption :label="$t('SETTINGS.COLOUR_THEME')" :init-selected="selectedTheme" :options="themes" :on-change="changeTheme" />
        <SwitchOption :label="$t('SETTINGS.COLOUR_BAR')" :store-key="'colourBar'" :store-category="'class'" />
        <SwitchOption :label="$t('SETTINGS.INCREASE_PERFORMANCE')" :store-key="'performance'" :store-category="'class'" />
    </section>
</template>

<style scoped lang="scss">

</style>