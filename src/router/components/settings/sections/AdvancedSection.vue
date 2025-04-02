<script>
import SubtitleOption from '../options/SubtitleOption.vue'
import SwitchOption from "../options/SwitchOption.vue";
import ButtonOption from '../options/ButtonOption.vue'

export default {
    name: "AdvancedSection",
    components: {
      ButtonOption,
        SwitchOption,
        SubtitleOption
    },
    data() {
        return {
            advancedFileInfoEnabled: window.localStorage.getItem('advancedFileInfo') === 'true'
        }
    },
    methods: {
        advancedFileInfoAction(enabled) {
            window.localStorage.setItem('advancedFileInfo', enabled)
            this.$store.commit('nav/updateAdvancedFileInfo', enabled)
            this.advancedFileInfoEnabled = enabled
        },
        showTour() {
          this.$store.commit('panel/updatePanelComponent', 'Welcome.vue')
          this.$store.commit('panel/updateActive', true)
        },
        restartWarning() {
            this.$store.commit('panel/showNewPrompt', {title: this.$t('PANEL.PROMPT.RESTART.TITLE'), message: this.$t('PANEL.PROMPT.RESTART.MESSAGE'), buttons: 'dismiss'})
        }
    }
}
</script>

<template>
    <section class="advanced">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.ADVANCED")}}</SubtitleOption>
        <SwitchOption :label="$t('SETTINGS.SHOW_FILE_CODEC')" :store-key="'fileCodec'" :store-category="'switchVx'" />
        <SwitchOption :label="$t('SETTINGS.DEBUG_MODE')" :store-key="'debugMode'" :store-category="'switchVx'" />
        <SwitchOption v-if="$store.state.nav.debugMode" :label="$t('SETTINGS.FORCE_RTL')" :store-key="'rtl'" :store-category="'switchVx'" :action="restartWarning" />
        <ButtonOption v-if="$store.state.nav.debugMode" :action="showTour" :label="'Launch first start tour'" :btn-label="'Start tour'" />
    </section>
</template>

<style scoped lang="scss">

</style>