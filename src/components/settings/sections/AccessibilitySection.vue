<script setup lang="ts">
import SubtitleOption from "../options/SubtitleOption.vue";
import SwitchOption from "../options/SwitchOption.vue";
import {ref} from "vue";

const highContrastEnabled = ref(window.localStorage.getItem('highContrast') === 'true');
const reducedMotionEnabled = ref(window.localStorage.getItem('reduceMotion') === 'true');
const boldTextEnabled = ref(window.localStorage.getItem('boldText') === 'true');

function highContrastAction(enabled) {
  highContrastEnabled.value = enabled
}
function reducedMotionAction(enabled) {
  reducedMotionEnabled.value = enabled
}
function boldTextAction(enabled) {
  boldTextEnabled.value = enabled
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