<template>
    <div class="root">
        <main>
            <div class="top-title">
                <h1>{{$t('SETTINGS.TITLE')}}</h1>
            </div>
            <div class="option-wrapper">
                <GeneralSection />
                <AccessibilitySection />
                <LibrarySection />
<!--                <AppearanceSection />-->
<!--                <IntegrationSection />-->
                <UpdatesSection />
                <AdvancedSection />
                <AboutSection />
            </div>
        </main>
    </div>
</template>

<script>
import LibrarySection from "../components/settings/sections/LibrarySection.vue";
import GeneralSection from "../components/settings/sections/GeneralSection.vue";
import AccessibilitySection from "../components/settings/sections/AccessibilitySection.vue";
import AppearanceSection from "../components/settings/sections/AppearanceSection.vue";
import UpdatesSection from "../components/settings/sections/UpdatesSection.vue";
import AdvancedSection from "../components/settings/sections/AdvancedSection.vue";
import AboutSection from "../components/settings/sections/AboutSection.vue";
import IntegrationSection from "../components/settings/sections/IntegrationSection.vue";

export default {
    name: "SettingsView.vue",
    components: {
        IntegrationSection,
        AboutSection,
        AdvancedSection,
        UpdatesSection,
        AppearanceSection,
        AccessibilitySection,
        GeneralSection,
        LibrarySection
    }
}
</script>

<style scoped lang="scss">
$currentGradColour: #006eff;

.root {
    padding: 0px 70px;
}

main {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
}

.option-wrapper {
    padding: 0px 70px 50px;
    width: 100%;
    max-width: 1050px;
}

.top-title {
    padding: 40px 70px 20px;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 1050px;
}

.top-title h1 {
    font-size: 3em;
    margin: 0;
    letter-spacing: -0.04em;
}

.darwin .top-title h1 {
    letter-spacing: -0.02em;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 450px;
    background: linear-gradient($currentGradColour, transparent);
    top: 0;
    z-index: -1;
}

.boldText .top-title h1 {
    font-weight: 800;
}
</style>