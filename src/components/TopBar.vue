<template>
    <div class="top-bar">
        <div class="inner">
            <div class="nav-hist-buttons">
                <TopNav v-for="item in nav" :key="item.type" :nav="item"/>
            </div>
            <div class="nav-top-buttons">
                <div class="std-top-btn search-btn" ref="searchButton" :class="showSearch ? 'active' : ''">
                    <i class="ft-icon" @click="showSearch = !showSearch">{{showSearch ? 'close' : 'search'}}</i>
                    <input @keydown="checkEsc" @focus="focused" @blur="unfocused" type="text" ref="search" placeholder="Search..." v-model="searchInput" @input="typingSearch">
                </div>
                <div class="top-button-container">
                    <TopButtons v-for="item in button" v-bind:button="item" v-bind:key="item.id"></TopButtons>
                </div>
                <div v-if="platform === 'win32'" class="divider" />
            </div>
        </div>
        <SearchPopup ref="popup" :results="searchOutput" :active="showSearch ? 'active' : ''" />
    </div>
</template>

<script>
import TopButtons from './TopButtons.vue'
import TopNav from './TopNav.vue'
import SearchPopup from './SearchPopup.vue'

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
                {id: 'settings', icon: 'settings'},
            ],
            nav: [
                {type: 'back', class: 'littlebitback', nav: -1, icon: 'chevron-left'},
                {type: 'forward', class: 'littlebitback', nav: 1, icon: 'chevron-right'}
            ],
            platform: process.platform,
            showSearch: false,
            searchInput: "",
            searchOutput: null
        }
    },
    methods: {
        sendButtonSignal(action) {
            window.ipcRenderer.send('do-custom-window-action', action)
        },
        focused() {
            this.$store.commit('audio/setPauseSpace', true)
        },
        unfocused() {
            this.$store.commit('audio/setPauseSpace', false)
        },
        checkEsc(evt) {
            if (evt.key == "Escape") this.showSearch = false
        },
        closeSearch() {
            this.showSearch = false
        },
        async typingSearch() {
            if (this.searchInput === '') return this.searchOutput = null
            const result = await window.ipcRenderer.invoke('do-full-query', this.searchInput)
            if (result.songs.length == 0 && result.artists.length == 0 && result.albums.length == 0 && result.playlists.length == 0) {
                this.searchOutput = -1
                return
            }
            this.searchOutput = result
        },
        popupClick(evt) {
            this.showSearch = this.$refs.popup.$el.contains(evt.target) || this.$refs.searchButton.contains(evt.target)
        }
    },
    watch: {
        showSearch() {
            if (this.showSearch) {
                this.$refs.search.focus()
                this.searchInput = ""
            } else this.searchOutput = null
        }
    },
    provide: function() {
        return {
            closeSearch: this.closeSearch
        }
    },
    destroyed() {
        window.removeEventListener('click', this.popupClick)
    },
    created() {
        window.addEventListener('click', this.popupClick)
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
    z-index: 10;
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
        width: 0;
        background: transparent;
        border: none;
        outline: none;
        height: 15px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: white;
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
        margin-left: 6px;
    }
}

.search-btn:hover i {
    opacity: 0.5;
}

.search-btn.active:hover i {
    opacity: 1;
}

.search-btn.active i:hover {
    opacity: 0.5;
    cursor: pointer;
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

html.blur {
    .inner {
        opacity: 0.5;
    }
}
</style>