<template>
    <div class="root">
        <main>
            <div class="top-title">
                <h1>Settings</h1>
            </div>
            <div class="option-wrapper">
                <Option class="option" v-for="item in options" :option="item" :key="item.id" :class="item.customClass"/>
            </div>
        </main>
    </div>
</template>

<script>
import Option from './Option'

export default {
    components: {
        Option
    },
    data() {
        return {
            options: [
                {
                    type: 'subtitle',
                    id: 'subtitleLib',
                    label: 'Library'
                },
                {
                    type: 'button',
                    id: 'removeLibBtn',
                    label: 'Clear your Firetail music library',
                    btnLabel: 'Clear Library',
                    action(vue) {
                        vue.$store.commit('panel/showNewPrompt', {title: 'Clear Library', message: "Are you sure you want to clear your current library? Your music files will not be deleted.", buttons: 'clearLibrary'})
                    }
                },
                {
                    type: 'subtitle',
                    id: 'subtitleAppearance',
                    label: 'Appearance'
                },
                {
                    type: 'dropdown',
                    id: 'altThemeDropdown',
                    label: 'App theme',
                    options: ['Firetail', 'Classic', 'Cyber'],
                    option: 'Firetail'
                },
                {
                    type: 'dropdown',
                    id: 'themeDropdown',
                    label: 'Colour theme',
                    options: ['System', 'Dark', 'Light'],
                    option: window.localStorage.getItem('theme'),
                    onChange(vue, option) {
                        window.localStorage.setItem('theme', option.toLowerCase())
                        switch(option) {
                            case 'Light':
                                document.documentElement.classList.remove('dark')
                                document.documentElement.classList.add('light')
                                break
                            case 'Dark':
                                document.documentElement.classList.remove('light')
                                document.documentElement.classList.add('dark')
                                break
                            case 'System':
                                if (window.matchMedia("(prefers-color-scheme: light").matches) {
                                    document.documentElement.classList.remove('dark')
                                    document.documentElement.classList.add('light')
                                } else {
                                    document.documentElement.classList.remove('light')
                                    document.documentElement.classList.add('dark')
                                }
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
                        }
                    }
                },
                {
                    type: 'switch',
                    id: 'highContrastSwitch',
                    label: 'Use high contrast style',
                    enabled: window.localStorage.getItem('highContrast'),
                    onClick(vue, enabled) {
                        window.localStorage.setItem('highContrast', enabled)
                    }
                },
                // TODO: actually add features to spotify integration that people would want to use
                // for the time being, this feature will remain unused
                /* {
                    type: 'subtitle',
                    id: 'subtitleSpotify',
                    label: 'Spotify Integration'
                },
                {
                    type: 'button',
                    id: 'connectSpotify',
                    label: 'Connect your Spotify account for extra metadata features',
                    btnLabel: 'Connect to Spotify',
                    customClass: 'spotify',
                    action(vue) {
                        vue.$store.commit('panel/updatePanelProps', {
                            topMsg: 'Spotify Integration'
                        })
                        vue.$store.commit('panel/updatePanelComponent', 'SpotifyIntegration')
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
                    id: 'spotifyPrivacyWarning',
                    message: `By using this feature, you agree to Spotify's privacy policy. You can opt-out by removing Firetail's access in your account settings.`
                }, */
                {
                    type: 'subtitle',
                    id: 'subtitleAdvanced',
                    label: 'Advanced'
                },
                {
                    type: 'switch',
                    id: 'advancedInfoSwitch',
                    label: 'Show file codec information',
                    enabled: window.localStorage.getItem('advancedFileInfo') === 'true',
                    onClick(vue, enabled) {
                        window.localStorage.setItem('advancedFileInfo', enabled)
                        vue.$store.commit('nav/updateAdvancedFileInfo', enabled)
                    }
                },
                {
                    type: 'subtitle',
                    id: 'subtitleAbout',
                    label: 'About'
                },
                {
                    type: 'about',
                    id: 'about'
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
$currentGradColour: #006eff;

.root {
    padding: 0px 70px;
}

main {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
}

.spotify {
    --hl-txt: #1DB954;
    --hl-op: #1DB9541a;
}

.option-wrapper {
    padding: 0px 70px 50px;
    width: 100%;
    max-width: 1050px;
}

.top-title {
    padding: 50px 70px 20px;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 1050px;
}

.top-title h1 {
    font-size: 5.5em;
    margin: 0;
    letter-spacing: -0.04em;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 450px;
    background: linear-gradient($currentGradColour, transparent);
    top: 0;
    z-index: -1;
}
</style>