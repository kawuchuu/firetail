<script setup lang="ts">
import LibrarySection from "../components/settings/sections/LibrarySection.vue";
import GeneralSection from "../components/settings/sections/GeneralSection.vue";
import AccessibilitySection from "../components/settings/sections/AccessibilitySection.vue";
import AppearanceSection from "../components/settings/sections/AppearanceSection.vue";
import UpdatesSection from "../components/settings/sections/UpdatesSection.vue";
import AdvancedSection from "../components/settings/sections/AdvancedSection.vue";
import AboutSection from "../components/settings/sections/AboutSection.vue";
import IntegrationSection from "../components/settings/sections/IntegrationSection.vue";
import {onMounted, onUnmounted, ref, watch} from "vue";
import DRText from "../components/DRText.vue";
import {audioPlayer} from "../renderer";

const showMoss = ref(false);
const mossClicked = ref(false);
const mossKeyCheck = ref(0);

function checkMossKey(e: KeyboardEvent) {
  if (/^(?!.*[mos]).*$/.test(e.key)) mossKeyCheck.value = 0;
  if (e.key === 'm' && mossKeyCheck.value === 0) return mossKeyCheck.value++;
  if (e.key === 'o' && mossKeyCheck.value === 1) return mossKeyCheck.value++;
  if (e.key === 's' && mossKeyCheck.value === 2) return mossKeyCheck.value++;
  if (e.key === 's' && mossKeyCheck.value === 3) {
    mossKeyCheck.value = 0;
    showMoss.value = true;
  }
}

watch(mossClicked, () => {
  if (audioPlayer.currentSong && !audioPlayer.paused) {
    audioPlayer.togglePlay();
  }
})

onMounted(() => {
  Math.random() <= 0.02 ? showMoss.value = true : showMoss.value = false;
  window.addEventListener('keydown', checkMossKey);
})

onUnmounted(() => {
  window.removeEventListener('keydown', checkMossKey);
});
</script>

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
                <IntegrationSection />
                <UpdatesSection />
                <AdvancedSection />
                <AboutSection />
            </div>
        </main>
    </div>
    <div v-if="mossClicked" @click="mossClicked = false" class="textbox-container">
      <DRText />
    </div>
    <div v-if="showMoss" class="egg">
      <img draggable="false" @click="mossClicked = true; showMoss = false;" class="moss" src="../assets/moss.png" />
    </div>
</template>

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

.textbox-container {
  position: fixed;
  width: calc(100% - var(--sidebar-width));
  height: 100%;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.egg {
  position: relative;
}

.moss {
  position: absolute;
  bottom: 0;
  left: 0;
  transform: rotate(90deg);
}
</style>