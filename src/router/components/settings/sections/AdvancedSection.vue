<script>
import SubtitleOption from '../options/SubtitleOption.vue'
import SwitchOption from "../options/SwitchOption.vue";

export default {
    name: "AdvancedSection",
    components: {
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
        }
    }
}
</script>

<template>
    <section class="advanced">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.ADVANCED")}}</SubtitleOption>
        <SwitchOption :label="$t('SETTINGS.SHOW_FILE_CODEC')" :init-enabled="advancedFileInfoEnabled" :action="advancedFileInfoAction" />
        <SwitchOption :label="$t('SETTINGS.FORCE_RTL')" :init-enabled="false" />
        <SwitchOption :label="$t('SETTINGS.DEV_MODE')" />
    </section>
</template>

<style scoped lang="scss">

</style>