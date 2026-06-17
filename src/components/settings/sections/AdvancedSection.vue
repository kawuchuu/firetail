<script setup lang="ts">
import SubtitleOption from '../options/SubtitleOption.vue'
import SwitchOption from "../options/SwitchOption.vue";
import {ref} from "vue";
import {viewStore} from "../../../renderer";

const advancedFileInfoEnabled = ref(window.localStorage.getItem('advancedFileInfo') === 'true');

function advancedFileInfoAction(enabled) {
  window.localStorage.setItem('advancedFileInfo', enabled);
  advancedFileInfoEnabled.value = enabled;
}

function toggleDebugMode() {
  viewStore.debugMode = !viewStore.debugMode;
}
</script>

<template>
    <section class="advanced">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.ADVANCED")}}</SubtitleOption>
        <SwitchOption :label="$t('SETTINGS.SHOW_FILE_CODEC')" :init-enabled="advancedFileInfoEnabled" :action="advancedFileInfoAction" />
        <SwitchOption :label="$t('SETTINGS.FORCE_RTL')" :init-enabled="false" />
        <SwitchOption :label="$t('SETTINGS.DEBUG_MODE')" :store-key="'debugMode'" :store-category="'switchVx'" :action="toggleDebugMode" />
    </section>
</template>

<style scoped lang="scss">

</style>