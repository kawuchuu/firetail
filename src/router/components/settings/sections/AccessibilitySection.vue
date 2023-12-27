<script>
import SubtitleOption from "../options/SubtitleOption.vue";
import SwitchOption from "../options/SwitchOption.vue";
export default {
    name: "AccessibilitySection",
    components: {
        SwitchOption,
        SubtitleOption
    },
    data() {
        return {
            highContrastEnabled: window.localStorage.getItem('highContrast') === 'true',
            reducedMotionEnabled: window.localStorage.getItem('reduceMotion') === 'true',
            boldTextEnabled: window.localStorage.getItem('boldText') === 'true'
        }
    },
    methods: {
        highContrastAction(enabled) {
            window.localStorage.setItem('highContrast', enabled)
            enabled ? document.documentElement.classList.add('high-contrast') : document.documentElement.classList.remove('high-contrast')
            this.highContrastEnabled = enabled
        },
        reducedMotionAction(enabled) {
            window.localStorage.setItem('reduceMotion', enabled)
            enabled ? document.documentElement.classList.add('reduce-motion') : document.documentElement.classList.remove('reduce-motion')
            this.reducedMotionEnabled = enabled
        },
        boldTextAction(enabled) {
            window.localStorage.setItem('boldText', enabled)
            enabled ? document.documentElement.classList.add('bold-text') : document.documentElement.classList.remove('bold-text')
            this.boldTextEnabled = enabled
        }
    }
}
</script>

<template>
    <section class="accessibility">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.ACCESSIBILITY")}}</SubtitleOption>
        <SwitchOption :label="$t('SETTINGS.USE_HIGH_CONTRAST')" :init-enabled="highContrastEnabled" :action="highContrastAction" />
        <SwitchOption :label="$t('SETTINGS.REDUCE_MOTION')" :init-enabled="reducedMotionEnabled" :action="reducedMotionAction" />
        <SwitchOption :label="$t('SETTINGS.BOLD_TEXT')" :init-enabled="boldTextEnabled" :action="boldTextAction" />
    </section>
</template>

<style scoped lang="scss">

</style>