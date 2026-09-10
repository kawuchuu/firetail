<script setup lang="ts">
import SubtitleOption from "../options/SubtitleOption.vue";
import DropdownOption from "../options/DropdownOption.vue";
import SwitchOption from "../options/SwitchOption.vue";

import {onBeforeMount, ref} from "vue";

const themes = ref([
  { label: 'SETTINGS.DROP_DOWN.COLOUR_THEME.SYSTEM', value: 'system' },
  { label: 'SETTINGS.DROP_DOWN.COLOUR_THEME.DARK', value: 'dark' },
  { label: 'SETTINGS.DROP_DOWN.COLOUR_THEME.LIGHT', value: 'light' },
]);

const selectedTheme = ref(null);

onBeforeMount(() => {
  selectedTheme.value = themes.value.find(item => item.value === 'dark');
})
</script>

<template>
    <section class="appearance-section">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.APPEARANCE")}}</SubtitleOption>
        <DropdownOption :label="$t('SETTINGS.COLOUR_THEME')" :init-selected="selectedTheme" :options="themes" />
        <SwitchOption :label="$t('SETTINGS.COLOUR_BAR')" :store-key="'colourBar'" :store-category="'class'" />
        <SwitchOption :label="$t('SETTINGS.INCREASE_PERFORMANCE')" :store-key="'performance'" :store-category="'class'" />
    </section>
</template>

<style scoped lang="scss">

</style>