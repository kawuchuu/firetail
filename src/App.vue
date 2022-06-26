<template>
    <div id="app" class="test" @dragover="changeDrag($event, true)">
        <div class="draggable" />
        <input type="file" multiple accept="audio/*" id="addFiles" @change="addFiles" style="display: none;">
        <div class="drag-detail">
            <p id="dragInfo">Nothing selected</p>
        </div>
        <div class="cover" style="transition:.25s;transition-property:opacity;width: 100%;height: 100%;position: fixed;z-index: 11;background: linear-gradient(#e74e8e, #ef9135);display: none;justify-content: center;align-items: center;">
            <!-- generated svg, slightly modified -->
            <svg style="width:150px;height:150px;" viewBox="0 0 1080 1080">
                <path class="st0" d="M653.4,462.8c-57.9-50-115.1-163.8-138.3-268.2c-42.6,37.6-109.4,138.7-97.3,281.5"/>
                <g>
                    <path class="st1" d="M299.9,861.7c-28.6-18.9-51.1-40.6-51.1-40.6c-19.1-18.4-33-36-42.5-49.5l0,0
                        c133.7,18.1,198.3-24.1,221.3-42.4c18.6-14.7,39.2-37,59-58.4c41.9-45.2,66.7-80.1,85.7-105.6C659.3,448.8,705,400.8,745.2,386.6
                        c68.6-24.3,117,32,160.2,53.6c0,0,0.2,0.1,0.2,0.1c-0.2,0.1-0.5,0.4-0.8,0.7c-39.6,35.1-56.8,104.8-63.9,179.3
                        C830.4,731.4,764,824.2,670,884.3c-58.4,37.3-123.4,58.6-184.3,52.4C401.4,928,306.3,865.9,299.9,861.7z"/>
                </g>
                <path class="st1" d="M152.8,211.5"/>
                <path class="st1" d="M450.4,710.8c-332.9,7.1-254.1-463.4-254.1-463.4c39.2,59.5,53.8,76.5,83.5,112.9c56.5,69,95.3,84.4,151.3,119.1c11.6,7.2,28.8,17.1,53.3,34.7c35.1,25.1,61.5,49,78.7,65.6"/>
            </svg>
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
            <div class="bg-cover" />
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
            sidebarisResizing: false
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
        require('./scss/test.scss')
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
.st0{fill:none;stroke:#221f1f;stroke-width:55;}
.st1{fill:none;stroke:#221f1f;stroke-width:55;stroke-miterlimit:10;}

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

    .resize-line {
        width: 1px;
        border-right: solid 1px #8a8a8a;
        box-sizing: border-box;
        height: 100%;
        opacity: 0;
    }
}

.sidebar-resizer:hover, .sidebar-resizer:active {
    .resize-line {
        opacity: 1;
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
    padding-top: 50px;
}

#app {
    height: 100%;
}

body {
    margin: 0;
    color: var(--text);
    background: transparent;
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
    background: #ffffff50;
    border-radius: 20px;
    min-height: 60px;
}

::-webkit-scrollbar-thumb:hover {
    background: #ffffff;
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

html.dark {
    --bg: #131313;
    --bg-op: #181818ad;
    --text: #ffffff;
    --fg-bg: #1e1e1e;
    --fg-bg-op: #25252584;
    --bd: #3a3a3a;
    --li-hv: #212121;
    --logo: 0.9;
    --switch: #3d3d3d;
    --hl: #252525;
}

html.light {
    --bg: #f3f3f3;
    --bg-op: #a6a6a633;
    --text: #242424;
    --fg-bg: #000000;
    --fg-bg-op: #ffffff84;
    --bd: #b4b4b4;
    --li-hv: #dddddd;
    --logo: 0.25;
    --switch: #cccccc;
    --hl: #cecece;
}

html.firetail {
    --hl-txt: #eb6e64;
    --hl-op: #eb6e642a;
    --gradient1: #e74e8e;
    --gradient2: #ef9135;
}

html.light.firetail {
    --hl-txt: #d44835;
}

@font-face {
    font-family: 'Inter';
    font-weight: normal;
    src: url('./assets/Inter-Regular.ttf') format('truetype');
}

@font-face {
    font-family: 'Inter';
    font-weight: bold;
    src: url('./assets/Inter-Bold.ttf') format('truetype');
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

    p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5em;
    }
}

.bg-cover {
    background: var(--bg);
    width: calc(100% - var(--sidebar-width));
    margin-left: var(--sidebar-width);
    height: 100%;
    position: fixed;
    z-index: -1;
}
</style>