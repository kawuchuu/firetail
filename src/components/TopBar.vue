<template>
    <div class="top-bar">
        <div class="inner">
            <div class="nav-hist-buttons">
                <TopNav v-for="item in nav" :key="item.type" :nav="item"/>
            </div>
            <div class="nav-top-buttons">
                <div class="std-top-btn search-btn" :class="showSearch ? 'active' : ''">
                    <i class="ft-icon" @click="showSearch = !showSearch">search</i>
                    <input @keydown="checkEsc" @focus="focused" @blur="unfocused" type="text" ref="search" placeholder="Search..." v-model="searchInput">
                </div>
                <div class="top-button-container">
                    <TopButtons v-for="item in button" v-bind:button="item" v-bind:key="item.id"></TopButtons>
                </div>
                <div v-if="platform === 'win32'" class="divider" />
                <!-- <div class="windows-custom-buttons">
                    <div class="window-button" @click="sendButtonSignal('minimize')"><img src="@/assets/minimise.svg"></div>
                    <div class="window-button" @click="sendButtonSignal(isMaximized ? 'unmaximize' : 'maximize')"><img :src="maximizeIcon"></div>
                    <div class="window-button close" @click="sendButtonSignal('close')"><img src="@/assets/close.svg"></div>
                </div> -->
            </div>
        </div>
        <SearchPopup :active="showSearch ? 'active' : ''" />
    </div>
</template>

<script>
import TopButtons from './TopButtons'
import TopNav from './TopNav'
import SearchPopup from './SearchPopup'
import { ipcRenderer } from 'electron'

export default {
    components: {
        TopButtons,
        TopNav,
        SearchPopup
    },
    data() {
        return {
            button: [
                {id: 'addFiles', for: 'addFiles', icon: 'add'},
            ],
            nav: [
                {type: 'back', class: 'littlebitback', nav: -1, icon: 'chevron-left'},
                {type: 'forward', class: 'littlebitback', nav: 1, icon: 'chevron-right'}
            ],
            platform: process.platform,
            maximizeIcon: require('@/assets/maximise.svg'),
            isMaximized: false,
            showSearch: false,
            searchInput: ""
        }
    },
    methods: {
        sendButtonSignal(action) {
            ipcRenderer.send('do-custom-window-action', action)
        },
        focused() {
            this.$store.commit('audio/setPauseSpace', true)
            this.searchInput = ""
        },
        unfocused() {
            this.$store.commit('audio/setPauseSpace', false)
            this.showSearch = false
        },
        checkEsc(evt) {
            if (evt.key == "Escape") this.showSearch = false
        }
    },
    async mounted() {
        if (await ipcRenderer.invoke('is-maximized') == true) {
            this.isMaximized = true
            this.maximizeIcon = require('@/assets/unmaximise.svg')
        }
        ipcRenderer.addListener('change-maximize-button', (event, icon) => {
            this.maximizeIcon = require(`@/assets/${icon}.svg`)
            this.isMaximized = icon == 'unmaximise'
        })
    },
    watch: {
        showSearch() {
            if (this.showSearch) this.$refs.search.focus()
        }
    }
}
</script>

<style lang="scss">
.std-top-btn {
    padding: 8px;
    border-radius: 40px;
    height: 18px;
    width: 18px;
}
</style>

<style lang="scss" scoped>
.top-bar {
    width: calc(100vw - var(--sidebar-width));
    height: 44px;
    background: transparent;
    position: relative;
    top: 0;
    pointer-events: none;
    background: var(--back-bg);
    -webkit-app-region: drag;
}

.top-bar .inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.top-button-container {
    display: flex;
    padding: 10px;
    padding-right: 15px;
    border-radius: 40px;
    pointer-events: all;
    //border: solid 1px #5f587c;
}

.nav-hist-buttons {
    display: flex;
    align-items: center;
    margin-left: 10px;
    pointer-events: all;
}

.nav-top-buttons {
    display: flex;
    align-items: center;
}

.search-btn {
    max-width: 200px;
    overflow: hidden;
    margin-right: 10px;
    pointer-events: all;
    cursor: pointer;
    //border: solid 1px #5f587c;

    display: flex;
    align-items: center;
    justify-content: space-between;

    transition: 0.15s;
    transition-property: width;

    -webkit-app-region: no-drag;
    
    i {
        font-size: 22px;
        transform: translate(-2px);
    }

    input[type=text] {
        width: 0px;
        background: transparent;
        border: none;
        outline: none;
        height: 15px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: white;
        margin-left: 6px;
        opacity: 0;
        pointer-events: none;
        transition: 0.15s;
        transition-property: width, opacity;
    }
}

.search-btn.active {
    width: 200px;
    cursor: default;
    background: rgba(255,255,255,.1);

    input {
        width: 165px;
        opacity: 1;
        pointer-events: all;
    }
}

.search-btn:hover i {
    opacity: 0.5;
}

.search-btn.active:hover i {
    opacity: 1;
}

.search-btn:active {
    opacity: 0.75;
}

.search-btn.active:active {
    opacity: 1;
}

.search-btn:active i {
    opacity: 0.5;
}

.search-btn.active:active i {
    opacity: 1;
}

html.dark .window-button img {
    filter: brightness(500);
}

.divider {
    margin: 0px 155px 0px 8px;
    width: 1px;
    height: 25px;
    border-left: solid 1px var(--text);
    opacity: 0.2;
}

.windows-custom-buttons {
    display: flex;
    -webkit-app-region: no-drag;
    pointer-events: all;
    padding: 0px 5px;
    height: 44px;
    align-items: center;
    background-color: var(--back-bg);
    position: relative;
    z-index: 30;
    border-radius: 0px 0px 0px 10px;

    .window-button {
        width: 47px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;

        img {
            width: 11px;
            pointer-events: none;
        }
    }

    .window-button:hover {
        background-color: var(--fg-bg);
    }

    .window-button:active {
        background-color: transparent;
    }

    .window-button.close:hover {
        background-color: #ff3a3a;
    }
}
</style>