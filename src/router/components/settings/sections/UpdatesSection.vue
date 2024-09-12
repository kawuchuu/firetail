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
                { label: 'SETTINGS.DROP_DOWN.UPDATE_BRANCH.STABLE', value: 'stable' },
                { label: 'SETTINGS.DROP_DOWN.UPDATE_BRANCH.PREVIEW', value: 'preview' },
                { label: 'SETTINGS.DROP_DOWN.UPDATE_BRANCH.DEVELOPMENT', value: 'dev' },
            ]
        }
    }
}
</script>

<template>
    <section class="updates">
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.UPDATE")}}</SubtitleOption>
        <ButtonOption :label="$t('SETTINGS.CHECK_UPDATE')" :btn-label="$t('SETTINGS.BUTTON.CHECK_UPDATE')" />
<!--        <DropdownOption :label="$t('SETTINGS.UPDATE_BRANCH')" :init-selected="updateBranches[0]" :options="updateBranches" />-->
    </section>
</template>

<style scoped lang="scss">

</style>