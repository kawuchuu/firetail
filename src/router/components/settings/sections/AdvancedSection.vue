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
        }
    }
}
</script>

<template>
    <section class="advanced">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.ADVANCED")}}</SubtitleOption>
        <SwitchOption :label="$t('SETTINGS.SHOW_FILE_CODEC')" :init-enabled="advancedFileInfoEnabled" :action="advancedFileInfoAction" />
        <SwitchOption :label="$t('SETTINGS.FORCE_RTL')" :init-enabled="false" />
        <SwitchOption :label="$t('SETTINGS.DEBUG_MODE')" :store-key="'debugMode'" :store-category="'switchVx'" />
        <ButtonOption v-if="$store.state.nav.debugMode" :action="showTour" :label="'Launch first start tour'" :btn-label="'Start tour'" />
    </section>
</template>

<style scoped lang="scss">

</style>