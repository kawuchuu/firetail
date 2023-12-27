<script>
import SubtitleOption from "../options/SubtitleOption.vue";
import ButtonOption from "../options/ButtonOption.vue";

export default {
    name: "LibrarySection.vue",
    components: {
        SubtitleOption,
        ButtonOption
    },
    methods: {
        clearLibrary() {
            this.$store.commit('panel/showNewPrompt', {title: 'Clear Library', message: "Are you sure you want to clear your current library? Your music files will not be deleted.", buttons: 'clearLibrary'})
        }
    }
}
</script>

<template>
    <section class="library">
        <SubtitleOption>{{$t('SETTINGS.SUBTITLES.LIBRARY')}}</SubtitleOption>
        <ButtonOption :action="clearLibrary" :label="$t('SETTINGS.CLEAR_LIBRARY')" :btn-label="this.$t('SETTINGS.BUTTON.CLEAR_LIBRARY')" />
        <ButtonOption :label="$t('SETTINGS.REFRESH_METADATA')" :btn-label="$t('SETTINGS.BUTTON.REFRESH')" />
    </section>
</template>

<style scoped lang="scss">

</style>