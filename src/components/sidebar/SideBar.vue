<template>
    <div class="side-bar">
        <div class="side-bar-inner-container">
            <div class="nav-buttons">
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
        ...mapState({
            getNavs: state => state.navs,
        }),
    }
}
</script>

<style>
.side-bar {
    width: 180px;
    height: 100vh;
    background: var(--fg-bg);
    border-right: solid 2px var(--bd);
    box-shadow: 1px 0px 5px rgba(0, 0, 0, .15);
    position: fixed;
    z-index: 2;
}

.side-bar-inner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    height: calc(100% - 139px);
}

.side-bar-inner-container::-webkit-scrollbar {
    display: none;
}

.side-bar button {
    width: 155px;
    height: 40px;
    margin-top: 20px;
}

.type-separator {
    width: 160px !important;
    min-height: 1px;
    background: var(--bd);
    margin: 0 10px;
    border-radius: 10px;
}

.item-sidebar {
    display: flex;
    width: 180px;
    height: 40px;
    align-items: center;
    cursor: pointer;
}

.router-link-active .item-sidebar{
    color: var(--hl-txt);
    cursor: default;
}

.item-sidebar:hover {
    color: var(--hl-txt)
}

.item-sidebar:active {
    opacity: 0.75;
    color: var(--hl-txt)
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

.router-link-active .item-sidebar i {
    margin: 0 16px 0 13px;
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
    margin: 15px 0 5px 16px;
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
</style>