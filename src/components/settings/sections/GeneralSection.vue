<script setup lang="ts">
import SubtitleOption from "../options/SubtitleOption.vue";
import DropdownOption from "../options/DropdownOption.vue";
import {onBeforeMount, ref, Ref} from "vue";
import {useI18n} from "vue-i18n";
import DropdownItem from "../../../types/DropdownItem";

const i18n = useI18n();

const locales:Ref<Array<DropdownItem>> = ref([{label: 'SETTINGS.DROP_DOWN.LANG_AUTO', value: "system"}]);
const startPages:Ref<Array<DropdownItem>> = ref([
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.HOME', value: 'home' },
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.SONGS', value: 'songs' },
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.ARTISTS', value: 'artists' },
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.ALBUMS', value: 'albums' },
  { label: 'SETTINGS.DROP_DOWN.START_SCREEN.FAVOURITES', value: 'favourites' },
]);
const currentLocale:Ref<DropdownItem> = ref({label: 'SETTINGS.DROP_DOWN.LANG_AUTO', value: "system"});

function changeLocale(locale:DropdownItem) {
  //if (locale.value === 'system') locale = {value: window.navigator.language}
  i18n.locale.value = locale.value;
  if (i18n.messages.value[locale.value]['RTL']) {
    if (!this.$store.state.nav.rtl) this.$store.commit('panel/showNewPrompt', {title: this.$t('PANEL.PROMPT.RESTART.TITLE'), message: this.$t('PANEL.PROMPT.RESTART.MESSAGE'), buttons: 'dismiss'})
    this.$store.commit('nav/updateRTL', true)
  } else {
    if (this.$store.state.nav.rtl) this.$store.commit('panel/showNewPrompt', {title: this.$t('PANEL.PROMPT.RESTART.TITLE'), message: this.$t('PANEL.PROMPT.RESTART.MESSAGE'), buttons: 'dismiss'})
    this.$store.commit('nav/updateRTL', false)
  }
}

onBeforeMount(async () => {
  const result = await window.ftStore.getItem('lang')
  console.log('ITEM IS ' + result)
  console.log(this)
  if (result !== 'system') currentLocale.value = {label: i18n.messages.value[i18n.locale.value].LANG_NAME, value: i18n.locale.value}
  i18n.availableLocales.forEach(locale => {
    if (i18n.messages.value[locale].LANG_NAME === "") locales.value.push({label: locale, value: locale})
    else locales.value.push({label: i18n.messages.value[locale].LANG_NAME, value: locale})
  })
})
</script>

<template>
    <section class="general">
        <SubtitleOption>{{$t('SETTINGS.SUBTITLES.GENERAL')}}</SubtitleOption>
        <DropdownOption :label="$t('SETTINGS.LANGUAGE')" :store-key="'lang'" :store-category="'multiOption'" :init-selected="currentLocale" :options="locales" :on-change="changeLocale"/>
        <DropdownOption :label="$t('SETTINGS.START_PAGE')" :init-selected="startPages[1]" :options="startPages"/>
    </section>
</template>

<style scoped lang="scss">

</style>