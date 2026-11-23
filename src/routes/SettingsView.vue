<script setup lang="ts">
import {settingsSections} from "../components/settings/sections";
import {onMounted, onUnmounted, ref, useTemplateRef, watch} from "vue";
import DRText from "../components/DRText.vue";
import {audioPlayer} from "../renderer";
import SideList from "../components/SideList.vue";

const root = useTemplateRef<HTMLElement>('root');
const activeSection = ref(settingsSections[0].id);
const sectionEls = new Map<string, HTMLElement>();
let scroller: HTMLElement | null = null;
let scrollLock: ReturnType<typeof setTimeout> | null = null;

function setSectionEl(id: string, el: unknown) {
  if (el instanceof HTMLElement) sectionEls.set(id, el);
  else sectionEls.delete(id);
}

function scrollToSection(id: string) {
  const el = sectionEls.get(id);
  if (!el) return;
  activeSection.value = id;
  const reduceMotion = document.documentElement.classList.contains('reduceMotion')
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (scrollLock) clearTimeout(scrollLock);
  scrollLock = setTimeout(releaseScrollLock, 1000);
  el.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block: 'start'});
}

function releaseScrollLock() {
  if (scrollLock) clearTimeout(scrollLock);
  scrollLock = null;
}

function updateActiveSection() {
  if (scrollLock || !scroller) return;
  if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) {
    activeSection.value = settingsSections[settingsSections.length - 1].id;
    return;
  }
  const threshold = scroller.getBoundingClientRect().top + 100;
  let current = settingsSections[0].id;
  for (const section of settingsSections) {
    const el = sectionEls.get(section.id);
    if (el && el.getBoundingClientRect().top <= threshold) current = section.id;
  }
  activeSection.value = current;
}

function onScrollEnd() {
  releaseScrollLock();
  updateActiveSection();
}

onMounted(() => {
  scroller = root.value?.closest<HTMLElement>('[data-overlayscrollbars-viewport]') ?? null;
  scroller?.addEventListener('scroll', updateActiveSection, {passive: true});
  scroller?.addEventListener('scrollend', onScrollEnd);
});

onUnmounted(() => {
  scroller?.removeEventListener('scroll', updateActiveSection);
  scroller?.removeEventListener('scrollend', onScrollEnd);
  releaseScrollLock();
});

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
    <div class="root" ref="root">
        <SideList>
            <nav class="settings-nav">
                <button
                    v-for="section in settingsSections"
                    :key="section.id"
                    type="button"
                    class="settings-nav-item"
                    :class="{active: activeSection === section.id}"
                    :aria-current="activeSection === section.id ? 'true' : undefined"
                    @click="scrollToSection(section.id)"
                >
                    {{ $t(`SETTINGS.SUBTITLES.${section.label}`) }}
                </button>
            </nav>
        </SideList>
        <main>
            <div class="top-title">
                <h1>{{$t('SETTINGS.TITLE')}}</h1>
            </div>
            <div class="option-wrapper">
                <div
                    v-for="section in settingsSections"
                    :key="section.id"
                    :ref="el => setSectionEl(section.id, el)"
                    class="settings-section"
                >
                    <component :is="section.component" />
                </div>
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
    --song-list-width: 240px;
}

main {
  position: relative;
  left: calc(var(--song-list-width) + 32px);
  width: calc(100% - var(--song-list-width) - 32px - 140px);
  height: calc(100vh - 44px - 85px);
  --main-border-radius-element: 0px;
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

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-nav-item {
  appearance: none;
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 15px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.75;
  transition: 0.1s;
  transition-property: background, opacity;
}

.settings-nav-item:hover {
  opacity: 1;
}

.settings-nav-item:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: -2px;
}

.settings-nav-item.active {
  background: var(--button);
  box-shadow: inset 0 0 0 1px var(--bd-op);
  opacity: 1;
  font-weight: 600;
}

.boldText .settings-nav-item.active {
  font-weight: bold;
}

.settings-section {
  scroll-margin-top: 16px;
}

@media (max-width: 1350px) {
  .root {
    --song-list-width: 200px;
  }

  .root .side-list-container:hover {
    width: var(--song-list-width);
  }
}
</style>