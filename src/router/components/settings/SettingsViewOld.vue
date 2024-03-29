<template>
    <div class="root">
        <main>
            <div class="top-title">
                <h1>{{$t('SETTINGS.TITLE')}}</h1>
            </div>
            <div class="option-wrapper">
                <SettingOption class="option" v-for="item in options" :option="item" :key="item.id" :class="item.customClass"/>
            </div>
        </main>
    </div>
</template>

<script>
import SettingOption from './SettingOption.vue'

export default {
    components: {
        SettingOption
    },
    data() {
        return {
            options: [
                {
                    type: 'subtitle',
                    id: 'subtitleGeneral',
                    label: this.$t('SETTINGS.SUBTITLES.GENERAL')
                },
                {
                    type: 'dropdown',
                    id: 'languageDropdown',
                    label: this.$t('SETTINGS.LANGUAGE'),
                    options: this.getLocales(),
                    option: 'Auto',
                    onChange(vue, option) {
                        vue.$root.$i18n.locale = option.value
                    }
                },
                {
                    type: 'dropdown',
                    id: 'startPageDropdown',
                    label: this.$t('SETTINGS.START_PAGE'),
                    options: [
                        { label: 'Home', value: 'home' },
                        { label: 'Songs', value: 'songs' },
                        { label: 'Artists', value: 'artists' },
                        { label: 'Albums', value: 'albums' },
                        { label: 'Favourites', value: 'favourites' },
                    ],
                    option: 'Songs',
                    onChange(vue, option) {
                        //window.localStorage.setItem('altTheme', option.toLowerCase())
                    }
                },
                {
                    type: 'subtitle',
                    id: 'subtitleAccessibility',
                    label: this.$t('SETTINGS.SUBTITLES.ACCESSIBILITY')
                },
                {
                    type: 'switch',
                    id: 'highContrastSwitch',
                    label: this.$t('SETTINGS.USE_HIGH_CONTRAST'),
                    enabled: window.localStorage.getItem('highContrast') == 'true',
                    conditions: {
                        enabled: {
                            type: 'store',
                            module: 'nav',
                            state: 'highContrastEnabled',
                        },
                        watch: {
                            item: 'nav/highContrastEnabled',
                            for: 'enabled',
                        }
                    },
                    onClick(vue, enabled) {
                        window.localStorage.setItem('highContrast', enabled)
                        enabled ? document.documentElement.classList.add('high-contrast') : document.documentElement.classList.remove('high-contrast')
                    }
                },
                {
                    type: 'switch',
                    id: 'reduceMotionSwitch',
                    label: this.$t('SETTINGS.REDUCE_MOTION'),
                    enabled: window.localStorage.getItem('reduceMotion') == 'true',
                    conditions: {
                        enabled: {
                            type: 'store',
                            module: 'nav',
                            state: 'reduceMotionEnabled',
                        },
                        watch: {
                            item: 'nav/reduceMotionEnabled',
                            for: 'enabled',
                        }
                    },
                    onClick(vue, enabled) {
                        window.localStorage.setItem('reduceMotion', enabled)
                        enabled ? document.documentElement.classList.add('reduce-motion') : document.documentElement.classList.remove('reduce-motion')
                    }
                },
                {
                    type: 'switch',
                    id: 'boldTextSwitch',
                    label: this.$t('SETTINGS.BOLD_TEXT'),
                    enabled: window.localStorage.getItem('boldText') == 'true',
                    conditions: {
                        enabled: {
                            type: 'store',
                            module: 'nav',
                            state: 'boldTextEnabled',
                        },
                        watch: {
                            item: 'nav/boldTextEnabled',
                            for: 'enabled',
                        }
                    },
                    onClick(vue, enabled) {
                        window.localStorage.setItem('boldText', enabled)
                        enabled ? document.documentElement.classList.add('bold-text') : document.documentElement.classList.remove('bold-text')
                    }
                },
                {
                    type: 'subtitle',
                    id: 'subtitleLib',
                    label: this.$t('SETTINGS.SUBTITLES.LIBRARY')
                },
                {
                    type: 'button',
                    id: 'removeLibBtn',
                    label: this.$t('SETTINGS.CLEAR_LIBRARY'),
                    btnLabel: this.$t('SETTINGS.BUTTON.CLEAR_LIBRARY'),
                    action(vue) {
                        vue.$store.commit('panel/showNewPrompt', {title: 'Clear Library', message: "Are you sure you want to clear your current library? Your music files will not be deleted.", buttons: 'clearLibrary'})
                    }
                },
                {
                    type: 'button',
                    id: 'refreshMetaBtn',
                    label: this.$t('SETTINGS.REFRESH_METADATA'),
                    btnLabel: this.$t('SETTINGS.BUTTON.REFRESH'),
                    action(vue) {
                        //vue.$store.commit('panel/showNewPrompt', {title: 'Clear Library', message: "Are you sure you want to clear your current library? Your music files will not be deleted.", buttons: 'clearLibrary'})
                    }
                },
                {
                    type: 'subtitle',
                    id: 'subtitleAppearance',
                    label: this.$t('SETTINGS.SUBTITLES.APPEARANCE')
                },
                // i think this will be left until after 1.0.0 releases
                /* {
                    type: 'dropdown',
                    id: 'altThemeDropdown',
                    label: this.$t('SETTINGS.APP_THEME'),
                    options: ['Firetail', 'Classic', 'Cyber'],
                    option: window.localStorage.getItem('altTheme') ? window.localStorage.getItem('altTheme') : 'Firetail',
                    onChange(vue, option) {
                        window.localStorage.setItem('altTheme', option.toLowerCase())
                    }
                }, */
                {
                    type: 'dropdown',
                    id: 'themeDropdown',
                    label: this.$t('SETTINGS.COLOUR_THEME'),
                    options: [
                        { label: 'System', value: 'system' },
                        { label: 'Dark', value: 'dark' },
                        { label: 'Light', value: 'light' },
                    ],
                    option: window.localStorage.getItem('theme'),
                    onChange(vue, option) {
                        window.localStorage.setItem('theme', option.toLowerCase())
                        // this manual setting of colour for the title bar is temporary :)
                        switch(option) {
                            case 'Light':
                                document.documentElement.classList.remove('dark')
                                document.documentElement.classList.add('light')
                                window.ipcRenderer.send('colour-theme-change', {
                                    bg: '#dfdfdf',
                                    fg: '#242424',
                                    blurFg: '#24242480'
                                })
                                break
                            case 'Dark':
                                document.documentElement.classList.remove('light')
                                document.documentElement.classList.add('dark')
                                window.ipcRenderer.send('colour-theme-change', {
                                    bg: '#000000',
                                    fg: '#ffffff',
                                    blurFg: '#ffffff80'
                                })
                                break
                            case 'System':
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
                },
                {
                    type: 'switch',
                    id: 'colourBarSwitch',
                    label: this.$t('SETTINGS.COLOUR_BAR'),
                    enabled: window.localStorage.getItem('colourBar') == 'true',
                    conditions: {
                        enabled: {
                            type: 'store',
                            module: 'nav',
                            state: 'colourBarEnabled',
                        },
                        watch: {
                            item: 'nav/colourBarEnabled',
                            for: 'enabled',
                        }
                    },
                    onClick(vue, enabled) {
                        window.localStorage.setItem('colourBar', enabled)
                        vue.$store.commit('nav/updateColourBar', enabled)
                    }
                },
                {
                    type: 'switch',
                    id: 'performanceSwitch',
                    label: this.$t('SETTINGS.INCREASE_PERFORMANCE'),
                    enabled: window.localStorage.getItem('performance') == 'true',
                    conditions: {
                        enabled: {
                            type: 'store',
                            module: 'nav',
                            state: 'increasePerformanceEnabled',
                        },
                        watch: {
                            item: 'nav/increasePerformanceEnabled',
                            for: 'enabled',
                        }
                    },
                    onClick(vue, enabled) {
                        window.localStorage.setItem('performance', enabled)
                        enabled ? document.documentElement.classList.add('performance') : document.documentElement.classList.remove('performance')
                    }
                },
/*                 {
                    type: 'switch',
                    id: 'macosVibrancySwitch',
                    label: 'Use transparency effects on macOS',
                    enabled: window.localStorage.getItem('vibrancy') == 'true',
                    onClick(vue, enabled) {
                        window.localStorage.setItem('vibrancy', enabled)
                        enabled ? document.documentElement.classList.add('vibrancy') : document.documentElement.classList.remove('vibrancy')
                    }
                }, */
                // TODO: actually add features to spotify integration that people would want to use
                // for the time being, this feature will remain unused
                {
                    type: 'subtitle',
                    id: 'subtitleSpotify',
                    label: 'Integrations'
                },
                {
                    type: 'button',
                    id: 'connectSpotify',
                    label: 'Connect your Spotify account for additional metadata features',
                    btnLabel: 'Connect to Spotify',
                    customClass: 'spotify',
                    action(vue) {
                        vue.$store.commit('panel/updatePanelProps', {
                            topMsg: 'Spotify Integration'
                        })
                        vue.$store.commit('panel/updatePanelComponent', 'SpotifyIntegration.vue')
                        vue.$store.commit('panel/updateActive', true)
                    },
                    conditions: {
                        show: {
                            type: 'store',
                            module: 'nav',
                            state: 'isSpotifyConnected',
                            onlyShow: false
                        }
                    }
                },
                {
                    type: 'button',
                    id: 'logoutSpotify',
                    label: 'Your Spotify account is currently connected to Firetail.',
                    btnLabel: 'Disconnect',
                    customClass: 'spotify',
                    action(vue) {
                        vue.$store.commit('panel/showNewPrompt', {title: 'Disconnect Spotify Account', message: `Are you sure you want to disconnect your Spotify account?`, buttons: 'spotifyLogout'})
                    },
                    conditions: {
                        show: {
                            type: 'store',
                            module: 'nav',
                            state: 'isSpotifyConnected',
                            onlyShow: true
                        },
                        label: {
                            type: 'store',
                            module: 'nav',
                            state: 'spotifyDetails',
                            baseString: `Hi, $$FTINSERT$$! Your Spotify account is currently connected to Firetail.`
                        },
                        watch: {
                            item: 'nav/spotifyDetails',
                            for: 'label',
                            objectKey: 'name'
                        }
                    }
                },
                {
                    type: 'text',
                    id: 'spotifyDisclaimer',
                    message: `By using this feature, you agree to Spotify's Terms and Conditions of Use and Privacy Policy. Some information about your Firetail library will be sent to Spotify in order to provide these features. You can opt-out at any time by removing the Firetail application in your Spotify account settings.`
                },
                {
                    type: 'button',
                    id: 'connectLastfm',
                    label: 'Connect your Last.fm account to scrobble your listening activity',
                    btnLabel: 'Connect to Last.fm',
                    customClass: 'lastfm',
                    /* action(vue) {
                        vue.$store.commit('panel/updatePanelProps', {
                            topMsg: 'Spotify Integration'
                        })
                        vue.$store.commit('panel/updatePanelComponent', 'SpotifyIntegration.vue')
                        vue.$store.commit('panel/updateActive', true)
                    }, */
/*                     conditions: {
                        show: {
                            type: 'store',
                            module: 'nav',
                            state: 'isSpotifyConnected',
                            onlyShow: false
                        }
                    } */
                },
                {
                    type: 'text',
                    id: 'lastfmDisclaimer',
                    message: `By using this feature, you agree to Last.fm's Terms of Use and Privacy Policy. Your listening activity will be sent to Last.fm. You can opt-out at any time by removing the Firetail application in your Last.fm account settings.`
                },
                {
                    type: 'subtitle',
                    id: 'subtitleUpdates',
                    label: this.$t('SETTINGS.SUBTITLES.UPDATE')
                },
                {
                    type: 'button',
                    id: 'checkUpdateBtn',
                    label: this.$t('SETTINGS.CHECK_UPDATE'),
                    btnLabel: this.$t('SETTINGS.BUTTON.CHECK_UPDATE'),
                    /* action(vue) {
                        vue.$store.commit('panel/showNewPrompt', {title: 'Clear Library', message: "Are you sure you want to clear your current library? Your music files will not be deleted.", buttons: 'clearLibrary'})
                    } */
                },
                {
                    type: 'dropdown',
                    id: 'updateBranchDropdown',
                    label: this.$t('SETTINGS.UPDATE_BRANCH'),
                    options: [
                        { label: 'Stable', value: 'stable' },
                        { label: 'Preview', value: 'preview' },
                        { label: 'Development', value: 'dev' },
                    ],
                    option: 'Stable',
                    onChange(vue, option) {
                        //window.localStorage.setItem('altTheme', option.toLowerCase())
                    }
                },
                {
                    type: 'subtitle',
                    id: 'subtitleAdvanced',
                    label: this.$t('SETTINGS.SUBTITLES.ADVANCED')
                },
                {
                    type: 'switch',
                    id: 'advancedInfoSwitch',
                    label: this.$t('SETTINGS.SHOW_FILE_CODEC'),
                    enabled: window.localStorage.getItem('advancedFileInfo') === 'true',
                    onClick(vue, enabled) {
                        window.localStorage.setItem('advancedFileInfo', enabled)
                        vue.$store.commit('nav/updateAdvancedFileInfo', enabled)
                    }
                },
                {
                    type: 'switch',
                    id: 'rtlForceSwitch',
                    label: this.$t('SETTINGS.FORCE_RTL'),
                    enabled: false,
                    onClick(vue, enabled) {
                        
                    }
                },
                {
                    type: 'subtitle',
                    id: 'subtitleAbout',
                    label: this.$t('SETTINGS.SUBTITLES.ABOUT')
                },
                {
                    type: 'about',
                    id: 'about'
                }
            ]
        }
    },
    methods: {
        getLocales() {
            const locales = [{label: 'Auto', value: 'system'}]
            this.$i18n.availableLocales.forEach(locale => {
                if (this.$i18n.messages[locale].LANG_NAME === "") locales.push({label: locale, value: locale})
                else locales.push({label: this.$i18n.messages[locale].LANG_NAME, value: locale})
            })
            return locales
        }
    }
}
</script>

<style lang="scss" scoped>

</style>