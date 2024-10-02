<script setup lang="ts">
import SideBar from './components/sidebar/SideBar.vue'
import './assets/ft-icon/ft-icon.css'
import './themes/firetail.scss';
import PlayingBar from "./components/playingbar/PlayingBar.vue";
import TopBar from "./components/TopBar.vue";
import {viewStore} from "./renderer";
import {onBeforeMount, onMounted, ref} from "vue";

const isDraggedOver = ref(false);

function onScroll(evt:Event) {
  viewStore.scroll = (evt.target as HTMLElement).scrollTop;
}

function getPlatform() {
  return window.process.platform
}

function changeDrag(evt:DragEvent, change:boolean) {
  if (evt.dataTransfer && evt.dataTransfer.types[0] !== 'Files') return
  if (evt.preventDefault) {
    evt.preventDefault();
  }
  isDraggedOver.value = change
}

onBeforeMount(async () => {
  document.documentElement.classList.add('dark');
  viewStore.defaultImagePath = await window.path.getImages();
})
</script>

<template>
  <main :class="getPlatform()" @dragover="changeDrag($event, true)">
    <div :class="isDraggedOver ? 'dragactive': ''" @dragleave="changeDrag($event,false)" class="drag-indicator">
      <div class="drag-msg">
        <h1>Drop your music here</h1>
        <p>You can drop music files and folders with music inside</p>
      </div>
    </div>
    <div class="main-content">
      <SideBar />
      <div class="screen-container">
        <TopBar />
        <div class="content" @scroll="onScroll">
          <RouterView />
        </div>
      </div>
    </div>
    <PlayingBar/>
  </main>
</template>

<style>
@font-face {
  font-family: 'Inter';
  src: url('./assets/Inter.ttf') format('truetype');
}

@font-face {
  font-family: 'Inter Display';
  font-weight: 700;
  src: url('./assets/InterDisplay-Bold.ttf') format('truetype');
}

@font-face {
  font-family: 'Figtree';
  src: url('./assets/figtree-variable.woff2') format('woff');
}

html {
  --main-border-radius: 10px 0px 0px 10px;
  --main-border-radius-element: 10px 0px 0px;
  --sidebar-width: 225px;
  --hl-txt: #1f88ff;
  --hl-op: #1f88ff2a;
  --song-list-width: 0px;
}

html.dark {
  --back-bg: #0a0a0a;
  --bg: #131313;
  --text: #ffffff;
  --text-op: #ffffff2f;
  --fg-bg: #1e1e1e;
  --sub-fg: #0e0e0e;
  --bd: #3a3a3a;
  --mono-bd: #ffffff25;
  --button: #242424;
}

html.light {
  --back-bg: #dfdfdf;
  --bg: #f3f3f3;
  --text: #000000;
  --text-op: #2424246c;
  --fg-bg: #ffffff;
  --sub-fg: #dadada;
  --bd: #b4b4b4;
  --mono-bd: #b4b4b4;
  --button: var(--fg-bg);
}

::-webkit-scrollbar {
  width: 16px !important;
  -webkit-app-region: no-drag;
  background: none;
}

::-webkit-scrollbar-thumb {
  background: var(--text-op);
  border-radius: 20px;
  min-height: 60px;
  background-clip: content-box;
  border: 4px solid transparent;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text);
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:active {
  background: var(--hl-txt);
  background-clip: content-box;
}

::-webkit-scrollbar-button {
  display: none
}

::-webkit-scrollbar-corner {
  display: none;
}

body {
  margin: 0;
  color: var(--text);
  background: var(--back-bg);
  font-family: 'Figtree', -apple-system, BlinkMacSystemFont, Inter, Arial, Helvetica, sans-serif !important;
  user-select: none;
  -webkit-user-select: none;
  color-scheme: dark;
  height: 100vh;
}

.main-content {
  display: grid;
  grid-template-columns: var(--sidebar-width) 0px 1fr;
  height: 100%;
}

.content {
  overflow: hidden;
  overflow-y: auto;
  position: fixed;
  height: calc(100% - 129px);
  width: calc(100% - var(--sidebar-width));
  background: var(--bg);
  border-radius: var(--main-border-radius);
  right: 0;
}

a {
  color: var(--text);
  text-decoration: none;
}

h1, h2 {
  /*font-family: 'Inter Display', 'Inter', sans-serif;*/
  font-weight: 650;
  letter-spacing: -0.015em;
}

.drag-indicator {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 20;
  background: rgba(0,0,0,.75);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: none;
  opacity: 0;
  transition: 0.15s;

  .drag-msg {
    pointer-events: none;
    padding: 65px 70px;
    border: dashed 4px var(--hl-txt);
    border-radius: 20px;
    background: var(--hl-op);

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    h1 {
      font-weight: 600;
      letter-spacing: -0.01em;
      margin: 0;
    }

    p {
      opacity: 1;
      margin-bottom: 0;
    }
  }
}

.drag-indicator.dragactive {
  opacity: 1;
  pointer-events: all;
}
</style>