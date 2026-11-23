<script setup lang="ts">
import SubtitleOption from "../options/SubtitleOption.vue";
import DropdownOption from "../options/DropdownOption.vue";
import {computed, ref, Ref} from "vue";
import {useI18n} from "vue-i18n";
import DropdownItem from "../../../types/DropdownItem";
import SwitchOption from "../options/SwitchOption.vue";
import {audioPlayer} from "../../../renderer";
import {applyLocaleToDocument, getSavedLocalePref, resolveLocale, SYSTEM_LOCALE} from "../../../modules/locale";

function gaplessAction(enabled: boolean) {
  audioPlayer.setGapless(enabled);
}

const i18n = useI18n();

function allMessages() {
  return i18n.messages.value as Record<string, Record<string, unknown>>;
}

const locales = computed<DropdownItem[]>(() => [
  {label: 'SETTINGS.DROP_DOWN.LANG_AUTO', value: SYSTEM_LOCALE},
  ...i18n.availableLocales.map(locale => {
    const name = allMessages()[locale]?.LANG_NAME;
    return {label: typeof name === 'string' && name ? name : locale, value: locale};
  }),
]);
const startPages:Ref<Array<DropdownItem>> = ref([
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.HOME', value: 'home' },
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.SONGS', value: 'songs' },
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.ARTISTS', value: 'artists' },
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.ALBUMS', value: 'albums' },
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.FAVOURITES', value: 'favourites' },
]);
const savedPref = getSavedLocalePref();
const currentLocale: Ref<DropdownItem> = ref(
  locales.value.find(item => item.value === savedPref) ?? locales.value[0]
);

function changeLocale(item: DropdownItem) {
  const locale = resolveLocale(item.value, i18n.availableLocales);
  i18n.locale.value = locale;
  applyLocaleToDocument(locale, allMessages());
}
</script>

<template>
    <section class="general">
        <SubtitleOption>{{$t('SETTINGS.SUBTITLES.GENERAL')}}</SubtitleOption>
        <DropdownOption :label="$t('SETTINGS.LANGUAGE')" :store-key="'lang'" :store-category="'multiOption'" :init-selected="currentLocale" :options="locales" :on-change="changeLocale"/>
        <DropdownOption :label="$t('SETTINGS.START_PAGE')" :init-selected="startPages[1]" :options="startPages"/>
        <SwitchOption :label="$t('SETTINGS.GAPLESS_PLAYBACK')" :store-key="'gaplessPlayback'" :store-category="'audio'" :action="gaplessAction" />
    </section>
</template>

<style scoped lang="scss">

</style>