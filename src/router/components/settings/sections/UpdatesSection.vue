<script>
import SubtitleOption from "../options/SubtitleOption.vue";
import ButtonOption from "../options/ButtonOption.vue"
import DropdownOption from "../options/DropdownOption.vue";
export default {
    name: "UpdatesSection",
    components: {
        DropdownOption,
        ButtonOption,
        SubtitleOption
    },
    data() {
        return {
            updateBranches: [
                { label: 'Stable', value: 'stable' },
                { label: 'Preview', value: 'preview' },
                { label: 'Development', value: 'dev' },
            ]
        }
    }
}
</script>

<template>
    <section class="updates">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.UPDATE")}}</SubtitleOption>
        <ButtonOption :label="$t('SETTINGS.CHECK_UPDATE')" :btn-label="$t('SETTINGS.BUTTON.CHECK_UPDATE')" />
        <DropdownOption :label="$t('SETTINGS.UPDATE_BRANCH')" :init-selected="updateBranches[0]" :options="updateBranches" />
    </section>
</template>

<style scoped lang="scss">

</style>