<script>
import SubtitleOption from "../options/SubtitleOption.vue";
import ButtonOption from "../options/ButtonOption.vue";
import TextOption from "../options/TextOption.vue";
export default {
    name: "IntegrationSection",
    components: {
        SubtitleOption,
        ButtonOption,
        TextOption
    },
    methods: {
        openSpotifyPanel() {
            this.$store.commit('panel/updatePanelProps', {
                topMsg: 'Spotify Integration'
            })
            this.$store.commit('panel/updatePanelComponent', 'SpotifyIntegration.vue')
            this.$store.commit('panel/updateActive', true)
        }
    }
}
</script>

<template>
    <section class="integrations">
        <SubtitleOption>{{$t('SETTINGS.SUBTITLES.INTEGRATION')}}</SubtitleOption>
        <ButtonOption v-if="!$store.state.nav.isSpotifyConnected" class="spotify" :label="$t('SETTINGS.SPOTIFY_INTEGRATION_DISCONNECTED')" :btn-label="$t('SETTINGS.BUTTON.CONNECT_SPOTIFY')" :action="openSpotifyPanel" />
        <TextOption v-if="!$store.state.nav.isSpotifyConnected">{{$t('SETTINGS.SPOTIFY_DISCLAIMER')}}</TextOption>
        <ButtonOption v-if="$store.state.nav.isSpotifyConnected" :label="$t('SETTINGS.SPOTIFY_INTEGRATION_CONNECTED', {user: $store.state.nav.spotifyDetails.name})" :btn-label="$t('SETTINGS.BUTTON.DISCONNECT')" />
        <ButtonOption class="lastfm" :label="$t('SETTINGS.LASTFM_INTEGRATION_DISCONNECTED')" :btn-label="$t('SETTINGS.BUTTON.CONNECT_LASTFM')" />
        <TextOption>{{$t('SETTINGS.LASTFM_DISCLAIMER')}}</TextOption>
    </section>
</template>

<style scoped lang="scss">

</style>