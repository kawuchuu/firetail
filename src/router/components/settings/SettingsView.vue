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
                <AppearanceSection />
                <UpdatesSection />
                <AdvancedSection />
                <AboutSection />
            </div>
        </main>
    </div>
</template>

<script>
import LibrarySection from "./sections/LibrarySection.vue";
import GeneralSection from "./sections/GeneralSection.vue";
import AccessibilitySection from "./sections/AccessibilitySection.vue";
import AppearanceSection from "./sections/AppearanceSection.vue";
import UpdatesSection from "./sections/UpdatesSection.vue";
import AdvancedSection from "./sections/AdvancedSection.vue";
import AboutSection from "./sections/AboutSection.vue";

export default {
    name: "SettingsView.vue",
    components: {
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

.spotify {
    --hl-txt: #1DB954;
    --hl-op: #1DB9541a;
}

.lastfm {
    --hl-txt: #ff3a3a;
    --hl-op: #ff3a3a1a;
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
    font-size: 3.5em;
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

.bold-text .top-title h1 {
    font-weight: 800;
}
</style>