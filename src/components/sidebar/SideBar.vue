<template>
    <div class="side-bar" :class="platformType">
        <div class="side-bar-inner-container">
            <div class="nav-buttons" :class="platformType">
                <!-- <div class="app-info">
                    <div class="firetail-icon"/>
                    <div class="app-name">{{ $t('APP_NAME') }}</div>
                    <div class="beta-tag">Beta</div>
                </div> -->
                <SideButtons v-for="item in getNavs" v-bind:button="item" v-bind:key="item.id"></SideButtons>
                <SidePlaylists v-for="item in playlists" :playlist="item" :key="item.id" />
            </div>
        </div>
    </div>
</template>

<script>
import SideButtons from './SideButtons.vue'
import { mapState } from 'vuex'
import SidePlaylists from './SidePlaylists.vue'

export default {
    components: {
        SideButtons,
        SidePlaylists
    },
    computed: {
        ...mapState('nav', {
            getNavs: state => state.navs,
        }),
        ...mapState('playlist', {
            playlists: state => state.playlists
        }),
        platformType() {
            if (process.platform === 'darwin') {
                return 'macos'
            } else return ''
        }
    }
}
</script>

<style lang="scss">
.side-bar {
    width: var(--sidebar-width);
    height: calc(100vh - 86px);
    /* background: var(--back-bg); */
    z-index: 2;
}

.side-bar.macos {
    //background: transparent !important;
}

.side-bar-inner-container {
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
    height: 100%;
}

.side-bar-inner-container::-webkit-scrollbar {
    /* background: var(--back-bg); */
    width: 12px !important;
}

.side-bar-inner-container::-webkit-scrollbar-thumb {
    border-color: var(--back-bg);
    border-width: 4px;
    background: var(--back-bg);
}

.side-bar-inner-container::-webkit-scrollbar-thumb:active {
    background: var(--hl-txt) !important;
}

.side-bar-inner-container:hover::-webkit-scrollbar-thumb {
    background-color: var(--text-op);
}

.nav-buttons {
    padding: 12px 0px 12px 12px;
}

.nav-buttons a {
    outline: none;
}

.nav-buttons.macos {
    margin-top: 32px;
}

.side-bar button {
    width: 100%;
    height: 40px;
    margin-top: 20px;
}

.item-sidebar {
    display: flex;
    width: 100%;
    height: 42px;
    align-items: center;
    cursor: pointer;
    opacity: 0.75;
    border-radius: 10px;
    background: transparent;
    transition: 0.1s;
    transition-property: background;
}

.router-link-active .item-sidebar {
    opacity: 1;
    cursor: default;
    background: var(--button);
}

.router-link-active .item-sidebar:hover {
    opacity: 1;
}

.item-sidebar:hover {
    opacity: 1;
}

.item-sidebar:active {
    opacity: 0.75;
}

.router-link-active .item-sidebar:active {
    opacity: 1;
}

.active-indicator {
    width: 3px;
    height: 30px;
    background: var(--hl-txt);
    position: relative;
    display: none;
    border-radius: 0 10px 10px 0;
    pointer-events: none;
}

.router-link-active .active-indicator {
    display: block
}

.item-sidebar i {
    margin: 0 12px;
    pointer-events: none;
    font-size: 24px;
}

.router-link-active .item-sidebar span {
    font-weight: 600;
}

.bold-text .router-link-active .item-sidebar span {
    font-weight: bold;
}

.item-sidebar span {
    font-size: 15px;
}

.list-subtitle {
    font-size: 15px;
    opacity: .75;
    //text-transform: uppercase;
    margin: 22px 0 5px 16px;
    padding-bottom: 10px;
    padding-left: 15px;
    border-bottom: 1px solid var(--text);
    transform: translateX(-15px);
    width: calc(100% - 17px);
}

/* .list-subtitle:first-of-type {
    margin-top: 6px !important;
} */

.firetail-icon {
    width: 35px;
    height: 35px;
    background-image: url('../../assets/logo-mono.svg');
    background-size: cover;
    margin: 0 7px 0 0;
    filter: brightness(10);
}

.app-info {
    display: none;
    align-items: center;
    padding: 15px;
    background: linear-gradient(black, black, black, transparent);
    position: fixed;
    z-index: 2;
    width: calc(var(--sidebar-width) - 50px);
}

.app-info.macos {
    padding-top: 40px;
}

.app-name {
    font-family: 'Inter';
    font-weight: bold;
    font-size: 18px;
    letter-spacing: -0.02em;
}

.beta-tag {
    font-size: 10px;
    padding: 2px 3px;
    border: solid 1px white;
    color: white;
    opacity: .75;
    border-radius: 20px;
    margin-left: 8px;
    position: relative;
    top: 1px;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.45em;
}

.special-button {
    display: flex;
    width: 100%;
    height: 42px;
    align-items: center;
    cursor: pointer;
    opacity: 0.75;
    border-radius: 5px;
    color: var(--text);
    transform: translatex(-4px);
}

.special-button:hover {
    opacity: 1;
}

.special-button span {
    font-size: 15px;
}

.special-button i {
    margin: 0 12px 0 16px;
    pointer-events: none;
    font-size: 20px;
    border: var(--text) 2px solid;
    border-radius: 3px;
}

.rtl {
    .list-subtitle {
        padding-left: 0px;
        padding-right: 15px;
        margin: 30px 16px 5px 0px;
        transform: translateX(15px);
    }

    .nav-buttons {
        padding: 12px 12px 12px 0px;
    }
}

html.blur {
    .item-sidebar, .special-button, .list-subtitle {
        opacity: 0.5;
    }
    .nav-buttons {
        filter: saturate(0.5);
    }
}
</style>