<template>
    <div class="top-bar">
        <div class="inner">
            <div class="nav-hist-buttons">
                <TopNav v-for="item in nav" :key="item.type" :nav="item"/>
            </div>
            <div class="nav-top-buttons">
                <div class="top-button-container">
                    <TopButtons v-for="item in button" v-bind:button="item" v-bind:key="item.id"></TopButtons>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TopButtons from './TopButtons'
import TopNav from './TopNav'
import tr from '../translation'

export default {
    components: {
        TopButtons,
        TopNav
    },
    data() {
        return {
            button: [
                {name: tr.t('topBar.addSongs'), id: 'addFiles', for: 'addFiles', icon: 'add'}
            ],
            nav: [
                {type: 'back', class: 'littlebitback', nav: -1, icon: 'arrow_back_ios'},
                {type: 'forward', class: 'littlebitforward', nav: 1, icon: 'arrow_forward_ios'}
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
.top-bar {
    width: calc(100% - #{$sidebarwidth});
    height: 50px;
    background: transparent;
    position: fixed;
    z-index: 10;
    top: 0;
    pointer-events: none;
}

.top-bar .inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 20px;
}

.top-button-container {
    display: flex;
    background: #000000b3;
    padding: 10px 20px;
    border-radius: 40px;
    pointer-events: all;
    backdrop-filter: blur(5px);
}

.nav-hist-buttons {
    display: flex;
    align-items: center;
    margin-left: 10px;
    pointer-events: all;
}
</style>