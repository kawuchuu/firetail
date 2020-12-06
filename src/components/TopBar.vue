<template>
    <div class="top-bar">
        <div class="inner">
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
import tr from '../translation'

export default {
    components: {
        TopButtons
    },
    data() {
        return {
            button: [
                {name: tr.t('topBar.nuke'), id: 'removeLibrary', icon: 'delete'},
                {name: tr.t('topBar.addSongs'), id: 'addFiles', for: 'addFiles', icon: 'add'},
                {name: 'Spotify Test', id: 'test', icon: 'build'}
            ]
        }
    },
    mounted() {
        console.log(this)
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
    justify-content: flex-end;
    margin-right: 20px;
}

.top-button-container {
    display: flex;
    background: #000000b3;
    padding: 10px 20px;
    border-radius: 40px;
    pointer-events: all;
}
</style>