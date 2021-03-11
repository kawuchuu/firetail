<template>
    <div class="root">
        <div class="bg-gradient"></div>
        <div class="top-title">
            <h1>Settings</h1>
        </div>
        <main>
            <div class="option-wrapper">
                <Option class="option" v-for="item in options" :item="item" :key="item.id" :class="item.customClass"/>
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

main {
    display: flex;
    justify-content: center;
    width: 100%;
}

.spotify {
    --hl-txt: #1DB954;
    --hl-op: #1DB9541a;
}

.option-wrapper {
    padding: 0px 70px 50px;
    width: 100%;
    max-width: 1150px;
}

.top-title {
    padding: 50px 70px 20px;
    display: flex;
    align-items: center;
}

.top-title h1 {
    font-size: 64px;
    margin: 0;
    letter-spacing: -2px;
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