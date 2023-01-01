<template>
    <div id="app" class="test" :class="platform" @dragover="changeDrag($event, true)">
        <input type="file" multiple accept="audio/*" id="addFiles" @change="addFiles" style="display: none;">
        <div class="drag-detail">
            <p id="dragInfo">Nothing selected</p>
        </div>
        <div :class="showDragIndicator" @dragleave="changeDrag(false)" @drop="filesDropped" class="drag-indicator">
            <div class="drag-msg">
                <h1>Drop your music here!</h1>
                <p>You can drop music files and folders with music inside</p>
            </div>
        </div>
        <Panel/>
        <ContextMenu/>
        <ItemAdd/>
        <Notification/>
        <ZenMode v-if="isFullscreen"/>
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
    </div>
</template>

<script>
import TopBar from './components/TopBar'
import SideBar from './components/sidebar/SideBar'
import PlayingBar from './components/playingbar/PlayingBar'
import Panel from './components/panel/Panel'
import ZenMode from './components/zen/ZenMode'
import ContextMenu from './components/ContextMenu'
import ItemAdd from '@/components/ItemAdd'
import Notification from '@/components/Notification'
import { ipcRenderer } from 'electron'
//import PluginComp from './PluginComp'

export default {
    name: 'App',
    components: {
        TopBar,
        SideBar,
        PlayingBar,
        Panel,
        ZenMode,
        ContextMenu,
        ItemAdd,
        Notification
    },
    methods: {
        addFiles(evt) {
            let files = []
            Array.from(evt.target.files).forEach(f => {
                if (!f.type.startsWith('audio')) return;
                files.push([f.path,f.name])
            })
            console.log(evt.target.files)
            ipcRenderer.send('addToLibrary', files)
        },
        changeDrag(evt, change) {
            if (evt.dataTransfer && evt.dataTransfer.types[0] !== 'Files') return
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            this.isDraggedOver = change
        },
        filesDropped(evt) {
            if (evt.dataTransfer && evt.dataTransfer.types[0] !== 'Files') return
            evt.preventDefault();
            let files = []
            Array.from(evt.dataTransfer.files).forEach(f => {
                /* console.log(f)
                if (!f.type.startsWith('audio')) return; */
                files.push([f.path,f.name])
            })
            //console.log(files)
            this.isDraggedOver = false
            ipcRenderer.send('addToLibrary', files)
        },
        resizeSidebar(evt) {
            if (!this.sidebarisResizing) return
            //if (evt.clientX < 185 || evt.clientX > 350) return
            if (evt.clientX < 185) {
                this.sidebarwidth = 185
            } else if (evt.clientX >= 217 && evt.clientX <= 233) {
                this.sidebarwidth = 225
            } else if (evt.clientX > 350) {
                this.sidebarwidth = 350
            } else {
                this.sidebarwidth = evt.clientX
            }
        }
    },
    data() {
        return {
            isDraggedOver: false,
            sidebarwidth: 225,
            sidebarisResizing: false,
            platform: process.platform
        }
    },
    watch: {
        sidebarwidth() {
            if (this.sidebarwidth < 185 || this.sidebarwidth > 350) return
            this.$refs.mainContentWrapper.style.setProperty('--sidebar-width', `${this.sidebarwidth}px`)
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
        }
    },
    async mounted() {
            require(`./scss/${window.localStorage.getItem('altTheme')}.scss`)
        if (window.localStorage.getItem('sidebarwidth')) {
            this.sidebarwidth = window.localStorage.getItem('sidebarwidth')
        } else {
            window.localStorage.setItem('sidebarwidth', 225)
        }
        const theme = window.localStorage.getItem('theme')
        if (!theme) window.localStorage.setItem('theme', 'system')
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
        if (window.localStorage.getItem('highContrast') == 'true') {
            document.documentElement.classList.add('high-contrast')
        } else if (await ipcRenderer.invoke('isHighContrastEnabled')) {
            document.documentElement.classList.add('high-contrast')
            localStorage.setItem('highContrast', true)
        }
        let port = await ipcRenderer.invoke('getPort')
        this.$store.commit('nav/updatePort', port)
        const playlists = await ipcRenderer.invoke('getAllPlaylists')
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
        let ver = await ipcRenderer.invoke('getVersion')
        let buildNum = await ipcRenderer.invoke('getBuildNum')
        if (buildNum == 'dev') {
            document.title = 'Firetail [dev]'
        } else if (ver.includes('alpha') && buildNum !== 'unknown' || ver.includes('alpha') && buildNum !== 'CUSTOM') {
            document.title = `Firetail [build ${buildNum}]`
        }
        this.$store.commit('nav/updateVer', ver)
        this.$store.commit('nav/updateBuildNum', buildNum)
        window.addEventListener('mousemove', this.resizeSidebar)
        window.addEventListener('mouseup', () => {
            this.sidebarisResizing = false
            window.localStorage.setItem('sidebarwidth', this.sidebarwidth)
        })
        if (window.localStorage.getItem('lastPlayed')) {
            this.$store.dispatch('audio/resumeState')
        }
    }
}
</script>

<style lang="scss">
html {
    --main-border-radius: 10px 0px 0px;
    --hl-txt: #1f88ff;
    --hl-op: #1f88ff2a;
}

html.dark {
    --back-bg: #0a0a0a;
    --bg: #131313;
    --text: #ffffff;
    --text-op: #ffffff50;
    --fg-bg: #1e1e1e;
    --sub-fg: #0e0e0e;
    --bd: #3a3a3a;
    --mono-bd: #3a3a3a;
    --button: #242424;
}

html.light {
    --back-bg: #dfdfdf;
    --bg: #f3f3f3;
    --text: #242424;
    --text-op: #2424246c;
    --fg-bg: #ffffff;
    --sub-fg: #dadada;
    --bd: #b4b4b4;
    --mono-bd: #b4b4b4;
    --button: var(--fg-bg);
}

@font-face {
    font-family: 'Inter';
    font-weight: normal;
    src: url('./assets/Inter-Regular.ttf') format('truetype');
}

@font-face {
    font-family: 'Inter';
    font-weight: 600;
    src: url('./assets/Inter-SemiBold.ttf') format('truetype');
}

@font-face {
    font-family: 'Inter';
    font-weight: bold;
    src: url('./assets/Inter-Bold.ttf') format('truetype');
}

.main-content-wrapper {
    --sidebar-width: 225px;
    display: grid;
    grid-template-columns: var(--sidebar-width) 0px 1fr;
    height: 100%;
}

.sidebar-resizer {
    width: 10px;
    height: 100%;
    position: absolute;
    left: calc(var(--sidebar-width) - 5px);
    z-index: 2;
    display: flex;
    justify-content: center;
    cursor: col-resize;
    z-index: 11;

    .resize-line {
        width: 1px;
        border-left: solid 1px #8a8a8a;
        box-sizing: border-box;
        height: 100%;
        opacity: 0;
        transition: 0.25s;
        transition-property: opacity;
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

        p {
            opacity: 0.65;
        }
    }
}

.drag-indicator.dragactive {
    opacity: 1;
    pointer-events: all;
}

.container {
    overflow: hidden;
    overflow-y: auto;
    position: fixed;
    height: calc(100% - 135px);
    width: calc(100% - var(--sidebar-width));
    background: var(--bg);
    border-radius: var(--main-border-radius);
}

#app {
    height: 100%;
}

body {
    margin: 0;
    color: var(--text);
    background: var(--back-bg);
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Overpass', 'Dosis', Arial, Helvetica, sans-serif !important;
    user-select: none;
    -webkit-user-select: none;
    color-scheme: dark;
    height: 100vh;
}

a {
    text-decoration: none;
    color: var(--text);
}

::-webkit-scrollbar {
    width: 16px !important;
    background: var(--bg);
    -webkit-app-region: no-drag;
}

::-webkit-scrollbar-thumb {
    border: solid 4px var(--bg);
    background: var(--text-op);
    border-radius: 20px;
    min-height: 60px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--text);
}

::-webkit-scrollbar-thumb:active {
    background: var(--hl-txt);
}

::-webkit-scrollbar-button {
    display: none
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
    border: 2px solid var(--text);
    border-left: 2px solid transparent;
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
    left: 280px;
    top: 150px;

    p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5em;
    }
}
</style>