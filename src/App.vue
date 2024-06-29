<script setup lang="ts">
import Sidebar from './components/sidebar/Sidebar.vue'
import './assets/ft-icon/ft-icon.css'
import './themes/firetail.scss';
import PlayingBar from "./components/playingbar/PlayingBar.vue";
</script>

<template>
    <main id="app" class="dark">

        <div class="main-content">
            <Sidebar />
            <div class="content">
                <RouterView />
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

#app {
    --main-border-radius: 10px 0px 0px;
    --sidebar-width: 225px;
    --hl-txt: #1f88ff;
    --hl-op: #1f88ff2a;
}

#app.dark {
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

#app.light {
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

body {
    margin: 0;
    color: white;
    background: black;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', Arial, Helvetica, sans-serif !important;
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
    overflow: overlay;
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
</style>