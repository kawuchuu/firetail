<template>
    <div class="side-bar">
        <div class="side-bar-inner-container">
            <div class="nav-buttons">
                <div class="app-info">
                    <div class="firetail-icon"/>
                    <div class="app-name">{{ $t('appName') }}</div>
                    <div class="beta-tag">Beta</div>
                </div>
                <SideButtons v-for="item in getNavs" v-bind:button="item" v-bind:key="item.id"></SideButtons>
            </div>
        </div>
    </div>
</template>

<script>
import SideButtons from './SideButtons'
import { mapState } from 'vuex'

export default {
    components: {
        SideButtons
    },
    computed: {
        ...mapState('nav', {
            getNavs: state => state.navs,
        }),
    }
}
</script>

<style lang="scss">
.side-bar {
    width: $sidebarwidth;
    height: 100%;
    background: #000;
    box-shadow: 1px 0px 5px rgba(0, 0, 0, .15);
    z-index: 2;
    color: white;
}

.side-bar-inner-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 100%;
}

.side-bar-inner-container::-webkit-scrollbar {
    display: none;
}

.nav-buttons {
    padding: 12px;
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
    border-radius: 5px;
    color: white;
}

.router-link-active .item-sidebar {
    opacity: 1;
    cursor: default;
    background: rgba(255,255,255,.15);
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
    margin: 0 16px;
    pointer-events: none;
    font-size: 20px;
}

.router-link-active .item-sidebar span {
    font-weight: bold;
}

.item-sidebar span {
    font-size: 15px;
    transform: translateY(1px);
}

.list-subtitle {
    font-size: 14px;
    opacity: .75;
    text-transform: uppercase;
    margin: 30px 0 5px 16px;
}

.playlist-sidename {
    height: 30px;
}

.playlist-sidename .active-indicator {
    height: 20px;
}

.playlist-sidename span {
    font-size: 14px;
    margin-left: 16px
}

.playlist-sidename.active span {
    margin-left: 13px
}

.firetail-icon {
    width: 35px;
    height: 35px;
    background-image: url('../../assets/firetail-menu.svg');
    background-size: cover;
    margin: 0 7px 0 0;
}

.app-info {
    display: flex;
    align-items: center;
    margin: 5px 15px 15px;
}

.app-name {
    font-family: 'Inter';
    font-weight: bold;
    font-size: 18px;
}

.beta-tag {
    font-size: 10px;
    padding: 3px 4px;
    border: solid 2px white;
    color: white;
    opacity: .75;
    border-radius: 20px;
    margin: 0px 10px 0px 10px;
    position: relative;
    top: 1px;
    font-weight: bold;
    text-transform: uppercase
}
</style>