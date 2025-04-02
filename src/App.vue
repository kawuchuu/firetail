<template>
    <div id="app" :class="this.rtl ? 'rtl' : ''" @dragover="changeDrag($event, true)">
<!--      <div class="noise"></div>-->
      <input type="file" multiple accept="audio/*" id="addFiles" @change="addFiles" style="display: none;">
        <div class="drag-detail">
            <p id="dragInfo">Nothing selected</p>
        </div>
        <div :class="showDragIndicator" @dragleave="changeDrag(false)" @drop="filesDropped" class="drag-indicator">
            <div class="drag-msg">
                <h1>Drop your music here</h1>
                <p>You can drop music files and folders with music inside</p>
            </div>
        </div>
        <CommandPalette/>
        <Panel/>
        <ContextMenu/>
        <ItemAdd/>
        <Notification/>
        <ZenMode v-if="isFullscreen"/>
        <TourInterface v-if="tourMode" />
        <div class="main-content-wrapper" ref="mainContentWrapper">
            <SideBar/>
            <div class="sidebar-resizer" @mousedown="sidebarisResizing = true" @mouseup="sidebarisResizing = false">
                <div class="resize-line" />
            </div>
            <div class="screen-container">
                <TopBar/>
                <main class="container" id="main-container" ref="container">
                    <router-view/>
                </main>
            </div>
        </div>
        <PlayingBar/>
        <BackgroundEffects/>
    </div>
</template>

<script>
import './themes/firetail.scss'
import TopBar from './components/TopBar.vue'
import SideBar from './components/sidebar/SideBar.vue'
import PlayingBar from './components/playingbar/PlayingBar.vue'
import Panel from './components/panel/PanelBase.vue'
import ZenMode from './components/zen/ZenMode.vue'
import ContextMenu from './components/ContextMenu.vue'
import ItemAdd from './components/ItemAdd.vue'
import Notification from './components/NotificationPopup.vue'
import CommandPalette from './components/CommandPalette.vue'
import BackgroundEffects from './components/BackgroundEffects.vue'
import TourInterface from "./components/tour/TourInterface.vue";

export default {
    name: 'App',
    components: {
      TourInterface,
        TopBar,
        SideBar,
        PlayingBar,
        Panel,
        ZenMode,
        ContextMenu,
        ItemAdd,
        Notification,
        CommandPalette,
        BackgroundEffects
    },
    methods: {
        addFiles(evt) {
            let files = []
            Array.from(evt.target.files).forEach(f => {
                if (!f.type.startsWith('audio')) return;
                files.push([window.webUtils.getPathForFile(f),f.name])
            })
            window.ipcRenderer.send('addToLibrary', [files, this.$route.path])
        },
        changeDrag(evt, change) {
            if (evt.dataTransfer && evt.dataTransfer.types[0] !== 'Files') {
              return
            }
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            this.isDraggedOver = change
        },
        filesDropped(evt) {
          console.log(evt.dataTransfer.types, 'wow')
            if (evt.dataTransfer && evt.dataTransfer.types[0] !== 'Files') return
            evt.preventDefault();
            let files = []
            Array.from(evt.dataTransfer.files).forEach(f => {
              console.log(f)
                files.push(window.webUtils.getPathForFile(f))
            })
            this.isDraggedOver = false
            window.ipcRenderer.send('addToLibrary', [files, this.$route.path])
        },
        resizeSidebar(evt) {
            if (!this.sidebarisResizing) return
            const pos = Math.abs(evt.clientX - (this.rtl ? window.innerWidth : 0))
            if (pos < 185) {
                this.sidebarwidth = 185
            } else if (pos >= 217 && pos <= 233) {
                this.sidebarwidth = 225
            } else if (pos > 350) {
                this.sidebarwidth = 350
            } else {
                this.sidebarwidth = pos
            }
        },
        applyClassSettings() {
            try {
              const keys = window.ftStoreSync.getCategory('class')
              if (keys) {
                keys.forEach(key => {
                    const result = window.ftStoreSync.getItem(key)
                    if (result) {
                        document.documentElement.classList.add(key)
                    }
                })
              }
            } catch(err) {
              console.error(err)
            }
        },
        async applyStoreSwitchSettings() {
            try {
                const keys = window.ftStoreSync.getCategory('switchVx')
                if (keys) {
                    keys.forEach(key => {
                        const result = window.ftStoreSync.getItem(key)
                        this.$store.commit(`nav/${key}`, result)
                    })
                }
            } catch(err) {
                console.error(`Could not get and apply switchVx keys: ${err}`)
            }
        },
        async applyMultiOptionSettings() {
            try {
                const keys = window.ftStoreSync.getCategory('multiOption')
                if (keys) {
                    keys.forEach(key => {
                        const result = window.ftStoreSync.getItem(key)
                        switch(key) {
                            case "lang":
                                if (result === 'system') return
                                this.$root.$i18n.locale = result
                        }
                    })
                }
            } catch(err) {
                console.error('Could not get and apply multiOption keys: ', err)
            }
        }
    },
    data() {
        return {
            isDraggedOver: false,
            sidebarwidth: 225,
            sidebarisResizing: false
        }
    },
    watch: {
        sidebarwidth() {
            if (this.sidebarwidth < 185 || this.sidebarwidth > 350) return
            document.documentElement.style.setProperty('--sidebar-width', `${this.sidebarwidth}px`)
        }
    },
    computed: {
        showDragIndicator() {
            if (this.isDraggedOver) {
                return 'dragactive'
            } else {
                return ''
            }
        },
        isFullscreen() {
            return this.$store.state.nav.fullscreen
        },
        rtl() {
            return this.$store.state.nav.rtl
        },
        tourMode() {
          return this.$store.state.nav.tourMode
        }
    },
    created() {
        console.log(this.$i18n)
        this.applyClassSettings()
        this.applyStoreSwitchSettings()
        this.applyMultiOptionSettings()
        if (this.$i18n.messages[this.$i18n.locale]['RTL']) this.$store.commit('nav/rtl', true)
    },
    async mounted() {
        if (window.localStorage.getItem('sidebarwidth')) {
            this.sidebarwidth = window.localStorage.getItem('sidebarwidth')
        } else {
            window.localStorage.setItem('sidebarwidth', 225)
        }
        const theme = window.localStorage.getItem('theme')
        if (!theme) window.localStorage.setItem('theme', 'dark')
        if (theme === 'light') {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
        } else if (theme !== 'dark' && window.matchMedia("(prefers-color-scheme: light").matches) {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
        }
        window.matchMedia("(prefers-color-scheme: light)").onchange = e => {
            if (window.localStorage.getItem('theme') !== 'system') return
            if (e.matches) {
                document.documentElement.classList.remove('dark')
                document.documentElement.classList.add('light')
            } else {
                document.documentElement.classList.add('dark')
                document.documentElement.classList.remove('light')
            }
        }
        if (theme === 'light') {
            window.ipcRenderer.send('colour-theme-change', {
                bg: '#e8e5f3',
                fg: '#242424',
                blurFg: '#24242480'
            })
        }
        if (window.localStorage.getItem('highContrast') == 'true') {
            document.documentElement.classList.add('high-contrast')
        } else if (await window.ipcRenderer.invoke('isHighContrastEnabled')) {
            document.documentElement.classList.add('high-contrast')
            localStorage.setItem('highContrast', true)
        }
        let port = await window.ipcRenderer.invoke('getPort')
        this.$store.commit('nav/updatePort', port)
        const playlists = await window.ipcRenderer.invoke('getAllPlaylists')
        this.$store.commit('playlist/setPlaylists', playlists)
        this.$refs.container.addEventListener('scroll', e => {
            this.$store.commit('nav/updateCurrentScroll', e.target.scrollTop)
        })
        if (localStorage.getItem('sp-token')) {
            this.$store.commit('nav/updateSpotifyActive', true)
            this.$store.commit('nav/updateSpotifyDetails', {
                name: localStorage.getItem('sp-name'),
                uri: localStorage.getItem('sp-uri')
            })
        }
        try {
            let ver = await window.ipcRenderer.invoke('getVersion')
            this.$store.commit('nav/updateVer', ver)
            let buildNum = await window.ipcRenderer.invoke('getBuildNum')
            if (buildNum == 'dev') {
                document.title = 'Firetail [dev]'
            } else if (ver.includes('alpha') && buildNum !== 'unknown' || ver.includes('alpha') && buildNum !== 'CUSTOM') {
                document.title = `Firetail [build ${buildNum}]`
            }
            this.$store.commit('nav/updateBuildNum', buildNum)
        } catch {}
        window.addEventListener('mousemove', this.resizeSidebar)
        window.addEventListener('mouseup', () => {
            this.sidebarisResizing = false
            window.localStorage.setItem('sidebarwidth', this.sidebarwidth)
        })
        if (window.localStorage.getItem('lastPlayed')) {
            this.$store.dispatch('audio/resumeState')
        }
        document.documentElement.classList.add(process.platform)
    }
}
</script>

<style lang="scss">
html {
    --main-border-radius: 10px 0px 0px;
    --sidebar-width: 225px;
    --hl-txt: #1f88ff;
    --hl-op: #1f88ff2a;
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

@font-face {
    font-family: 'Inter';
    src: url('./assets/Inter.ttf') format('truetype');
}

.main-content-wrapper {
    display: grid;
    grid-template-columns: var(--sidebar-width) 0px 1fr;
    height: 100%;
}

.sidebar-resizer {
    width: 10px;
    height: calc(100% - 85px);
    position: absolute;
    left: calc(var(--sidebar-width) - 5px);
    z-index: 2;
    display: flex;
    justify-content: center;
    cursor: col-resize;
    z-index: 11;

    .resize-line {
        width: 35px;
        border-left: solid 1px #8a8a8a;
        border-bottom: solid 1px #8a8a8a;
        border-radius: 0 0 0 10px;
        box-sizing: border-box;
        height: 100%;
        opacity: 0;
        transition: 0.25s;
        transition-property: opacity;
        transform: translateX(17px);
        mask-image: linear-gradient(-90deg, transparent, #000 25px);
        position: absolute;
        pointer-events: none;
    }
}

.rtl .sidebar-resizer {
    left: initial;
    right: calc(var(--sidebar-width) - 5px);

    .resize-line {
        transform: translateX(-17px) rotate(180deg) rotateX(180deg)
    }
}

.sidebar-resizer:hover, .sidebar-resizer:active {
    .resize-line {
        opacity: 1;
                transition-delay: 150ms;
    }
}

.sidebar-resizer:active {
    .resize-line {
        border-color: var(--hl-txt);
    }
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

.container {
    // ugh they just HAD to remove overflow overlay right when people start using it. staying on chromium 112 for as long as i can.
    //noinspection CssInvalidPropertyValue
    overflow: auto;
    position: fixed;
    height: calc(100% - 129px);
    width: calc(100% - var(--sidebar-width));
    background: var(--bg);
    border-radius: var(--main-border-radius);
}

.noise {
    width: 100%;
    height: 100%;
    position: fixed;
    background-image: url('./assets/noise.jpeg');
    background-size: 400px 400px;
    mix-blend-mode: overlay;
    opacity: 0.12;
    z-index: 999999;
    pointer-events: none;
}

#app {
    height: 100%;
}

#app.rtl {
    direction: rtl;
}

/*#app.rtl i {
    transform: rotate3d(0, 1, 0, 180deg);
}*/

body {
    margin: 0;
    color: var(--text);
    background: var(--back-bg);
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', Arial, Helvetica, sans-serif !important;
    user-select: none;
    
    -webkit-user-select: none;
    color-scheme: dark;
    height: 100vh;
}

::selection {
    background: var(--hl-txt);
    color: var(--text);
}

html.boldText body {
    font-weight: 600;
}

a {
    text-decoration: none;
    color: var(--text);
}

::-webkit-scrollbar {
    width: 16px !important;
    -webkit-app-region: no-drag;
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

.draggable {
    -webkit-app-region: drag;
    width: calc(100% - 16px);
    height: 50px;
    z-index: 100;
    pointer-events: none;
    position: fixed;
}

.load-spinner {
    border: 3px solid var(--text);
    border-left: 3px solid transparent;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.drag-detail {
    position: fixed;
    z-index: -2;
    background: var(--fg-bg);
    padding: 10px;
    border-radius: 5px;
    max-width: 280px;
    pointer-events: none;
    left: 400px;
    top: 150px;

    p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5em;
    }
}

.rtl {
    --main-border-radius: 0px 10px 10px 0px;
}
</style>