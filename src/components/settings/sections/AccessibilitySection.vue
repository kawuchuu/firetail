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
            this.highContrastEnabled = enabled
        },
        reducedMotionAction(enabled) {
            this.reducedMotionEnabled = enabled
        },
        boldTextAction(enabled) {
            this.boldTextEnabled = enabled
        }
    }
}
</script>

<template>
    <section class="accessibility">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.ACCESSIBILITY")}}</SubtitleOption>
        <SwitchOption :label="$t('SETTINGS.USE_HIGH_CONTRAST')" :init-enabled="highContrastEnabled" :store-key="'highContrast'" :store-category="'class'" :action="highContrastAction" />
        <SwitchOption :label="$t('SETTINGS.REDUCE_MOTION')" :init-enabled="reducedMotionEnabled" :store-key="'reduceMotion'" :store-category="'class'" :action="reducedMotionAction" />
        <SwitchOption :label="$t('SETTINGS.BOLD_TEXT')" :init-enabled="boldTextEnabled" :store-key="'boldText'" :store-category="'class'" :action="boldTextAction" />
    </section>
</template>

<style scoped lang="scss">

</style>